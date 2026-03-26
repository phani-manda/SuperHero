ALTER TABLE public.charities
  ADD COLUMN IF NOT EXISTS media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS upcoming_events JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, selected_charity_id, charity_percentage)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'selected_charity_id', '')::uuid,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'charity_percentage', '')::integer, 10)
  );
  RETURN NEW;
END;
$$;
