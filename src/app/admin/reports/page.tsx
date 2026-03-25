import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default async function AdminReportsPage() {
  const supabase = createServerSupabaseClient();

  // Gather analytics data
  const [usersRes, subsRes, drawsRes, contributionsRes, winnersRes] = await Promise.all([
    supabase.from('profiles').select('id, created_at') as any,
    supabase.from('subscriptions').select('id, plan_type, status') as any,
    supabase.from('draws').select('id, draw_month, total_pool_amount, status') as any,
    supabase.from('charity_contributions').select('amount, charity_id, charities(name)') as any,
    supabase.from('winners').select('prize_amount, match_type, payment_status') as any,
  ]);

  const users = usersRes.data || [];
  const subs = subsRes.data || [];
  const draws = drawsRes.data || [];
  const contributions = contributionsRes.data || [];
  const winners = winnersRes.data || [];

  const activeSubs = subs.filter((s: any) => s.status === 'active');
  const monthlyCount = activeSubs.filter((s: any) => s.plan_type === 'monthly').length;
  const yearlyCount = activeSubs.filter((s: any) => s.plan_type === 'yearly').length;

  const totalCharityAmount = contributions.reduce((s: any, c: any) => s + c.amount, 0);
  const totalPrizesPaid = winners
    .filter((w: any) => w.payment_status === 'paid')
    .reduce((s: any, w: any) => s + w.prize_amount, 0);

  // Group contributions by charity
  const charityBreakdown: Record<string, number> = {};
  for (const c of contributions) {
    const name = (c.charities as { name: string } | null)?.name || 'Unknown';
    charityBreakdown[name] = (charityBreakdown[name] || 0) + c.amount;
  }

  // Draw statistics
  const publishedDraws = draws.filter((d: any) => d.status === 'published');
  const matchBreakdown = {
    '5-match': winners.filter((w: any) => w.match_type === '5-match').length,
    '4-match': winners.filter((w: any) => w.match_type === '4-match').length,
    '3-match': winners.filter((w: any) => w.match_type === '3-match').length,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Subscription Breakdown */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Subscription Breakdown</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Users</span>
              <span className="font-medium">{users.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Active Subscribers</span>
              <span className="font-medium">{activeSubs.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Monthly Plans</span>
              <span className="font-medium">{monthlyCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Yearly Plans</span>
              <span className="font-medium">{yearlyCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Conversion Rate</span>
              <span className="font-medium">
                {users.length > 0
                  ? `${Math.round((activeSubs.length / users.length) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Draw Statistics */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Draw Statistics</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Draws Run</span>
              <span className="font-medium">{publishedDraws.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">5-Match Winners</span>
              <span className="font-medium">{matchBreakdown['5-match']}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">4-Match Winners</span>
              <span className="font-medium">{matchBreakdown['4-match']}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">3-Match Winners</span>
              <span className="font-medium">{matchBreakdown['3-match']}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Prizes Paid</span>
              <span className="font-medium">{formatCurrency(totalPrizesPaid)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Charity Contributions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Charity Contribution Totals</h2>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-4 pb-3 border-b border-gray-100">
              <span className="font-medium text-gray-700">Total Contributions</span>
              <span className="font-bold text-brand-700">{formatCurrency(totalCharityAmount)}</span>
            </div>
            <div className="space-y-2">
              {Object.entries(charityBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([name, amount]) => (
                  <div key={name} className="flex justify-between text-sm">
                    <span className="text-gray-600">{name}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
              {Object.keys(charityBreakdown).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">No contributions yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
