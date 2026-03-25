import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ScoreEntry } from '@/components/scores/score-entry';
import { SubscriptionCard } from '@/components/dashboard/subscription-card';
import { CharitySelector } from '@/components/dashboard/charity-selector';
import { DrawsSummary } from '@/components/dashboard/draws-summary';
import { Navbar } from '@/components/layout/navbar';

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // Fetch all dashboard data in parallel
  const [profileRes, subscriptionRes, scoresRes, entriesRes, winnersRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false }),
    supabase
      .from('draw_entries')
      .select('*, draws(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('winners')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const profile = profileRes.data;
  const subscription = subscriptionRes.data;
  const scores = scoresRes.data || [];
  const entries = entriesRes.data || [];
  const winners = winnersRes.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your scores, track draws, and support your charity.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            <ScoreEntry initialScores={scores} />
            <DrawsSummary entries={entries as never[]} winners={winners} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SubscriptionCard subscription={subscription} />
            <CharitySelector
              userId={user.id}
              currentCharityId={profile?.selected_charity_id || null}
              currentPercentage={profile?.charity_percentage || 10}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
