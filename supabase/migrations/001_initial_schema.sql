-- ============================================
-- Golf Charity Platform — Initial Schema
-- ============================================

-- Enums
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'incomplete');
CREATE TYPE draw_status AS ENUM ('pending', 'simulated', 'published');
CREATE TYPE draw_type AS ENUM ('random', 'algorithmic');
CREATE TYPE match_type AS ENUM ('5-match', '4-match', '3-match');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'paid');
CREATE TYPE contribution_source AS ENUM ('subscription', 'donation');

-- ============================================
-- 1. Profiles (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  stripe_customer_id TEXT UNIQUE,
  selected_charity_id UUID,
  charity_percentage INTEGER NOT NULL DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. Subscriptions
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- 3. Scores (rolling 5-score window)
-- ============================================
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_at DATE NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scores_user ON scores(user_id);
CREATE UNIQUE INDEX idx_scores_user_position ON scores(user_id, position);

-- ============================================
-- 4. Charities
-- ============================================
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT,
  website_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_received INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_charities_slug ON charities(slug);
CREATE INDEX idx_charities_featured ON charities(is_featured) WHERE is_featured = true;

-- Add FK from profiles to charities
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_charity
  FOREIGN KEY (selected_charity_id) REFERENCES charities(id) ON DELETE SET NULL;

-- ============================================
-- 5. Draws
-- ============================================
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  draw_month TEXT NOT NULL, -- format: YYYY-MM
  status draw_status NOT NULL DEFAULT 'pending',
  draw_type draw_type NOT NULL DEFAULT 'random',
  winning_numbers INTEGER[] NOT NULL DEFAULT '{}',
  total_pool_amount INTEGER NOT NULL DEFAULT 0,
  five_match_pool INTEGER NOT NULL DEFAULT 0,
  four_match_pool INTEGER NOT NULL DEFAULT 0,
  three_match_pool INTEGER NOT NULL DEFAULT 0,
  jackpot_rollover INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_draws_month ON draws(draw_month);

-- ============================================
-- 6. Draw Entries (snapshot of user scores at draw time)
-- ============================================
CREATE TABLE draw_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scores_snapshot INTEGER[] NOT NULL,
  matched_count INTEGER NOT NULL DEFAULT 0,
  prize_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_draw_entries_draw ON draw_entries(draw_id);
CREATE INDEX idx_draw_entries_user ON draw_entries(user_id);
CREATE UNIQUE INDEX idx_draw_entries_draw_user ON draw_entries(draw_id, user_id);

-- ============================================
-- 7. Winners
-- ============================================
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_type match_type NOT NULL,
  prize_amount INTEGER NOT NULL DEFAULT 0,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  proof_url TEXT,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_winners_draw ON winners(draw_id);
CREATE INDEX idx_winners_user ON winners(user_id);

-- ============================================
-- 8. Charity Contributions
-- ============================================
CREATE TABLE charity_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  source contribution_source NOT NULL DEFAULT 'subscription',
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contributions_user ON charity_contributions(user_id);
CREATE INDEX idx_contributions_charity ON charity_contributions(charity_id);

-- ============================================
-- Triggers
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_subscriptions_updated
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_charities_updated
  BEFORE UPDATE ON charities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Rolling 5-score window: auto-assign position and evict oldest
CREATE OR REPLACE FUNCTION manage_score_position()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER;
  oldest_id UUID;
BEGIN
  -- Count existing scores for this user
  SELECT COUNT(*) INTO score_count FROM scores WHERE user_id = NEW.user_id;

  IF score_count >= 5 THEN
    -- Find and delete the oldest score
    SELECT id INTO oldest_id
    FROM scores
    WHERE user_id = NEW.user_id
    ORDER BY played_at ASC, created_at ASC
    LIMIT 1;

    DELETE FROM scores WHERE id = oldest_id;
  END IF;

  -- Assign position based on chronological order
  SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
  FROM scores
  WHERE user_id = NEW.user_id;

  -- Wrap around if needed
  IF NEW.position > 5 THEN
    NEW.position := 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_score_position
  BEFORE INSERT ON scores
  FOR EACH ROW EXECUTE FUNCTION manage_score_position();

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;

-- Profiles: users read own, admins read all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Subscriptions: users see own, admins see all
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Scores: users manage own, admins manage all
CREATE POLICY "Users can view own scores"
  ON scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
  ON scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores"
  ON scores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores"
  ON scores FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all scores"
  ON scores FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Charities: public read, admin write
CREATE POLICY "Anyone can view active charities"
  ON charities FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage charities"
  ON charities FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Draws: public read published, admin manage
CREATE POLICY "Anyone can view published draws"
  ON draws FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage draws"
  ON draws FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Draw entries: users see own
CREATE POLICY "Users can view own entries"
  ON draw_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all entries"
  ON draw_entries FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Winners: users see own, admin manage
CREATE POLICY "Users can view own wins"
  ON winners FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own proof"
  ON winners FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all winners"
  ON winners FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Contributions: users see own
CREATE POLICY "Users can view own contributions"
  ON charity_contributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage contributions"
  ON charity_contributions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- Seed data: sample charities
-- ============================================
INSERT INTO charities (name, slug, description, is_featured) VALUES
  ('Golf for Good Foundation', 'golf-for-good', 'Supporting youth golf programs and community development through the power of sport.', true),
  ('Fairway Hearts', 'fairway-hearts', 'Providing golf therapy and rehabilitation programs for veterans and first responders.', true),
  ('Green Future Trust', 'green-future-trust', 'Environmental conservation focused on maintaining green spaces and golf course ecosystems.', false),
  ('Swing for Schools', 'swing-for-schools', 'Funding educational scholarships through community golf events and tournaments.', true),
  ('The Caddie Fund', 'the-caddie-fund', 'Supporting caddies and golf course workers with healthcare and emergency assistance.', false);
