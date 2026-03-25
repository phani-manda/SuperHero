import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Users, Dices, Heart, Trophy } from 'lucide-react';

export default async function AdminOverview() {
  const supabase = createServerSupabaseClient();

  const [usersRes, subsRes, charitiesRes, drawsRes, winnersRes, contributionsRes] =
    await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('charities').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('draws').select('id, total_pool_amount').eq('status', 'published'),
      supabase.from('winners').select('prize_amount'),
      supabase.from('charity_contributions').select('amount'),
    ]);

  const totalUsers = usersRes.count || 0;
  const activeSubscribers = subsRes.count || 0;
  const totalCharities = charitiesRes.count || 0;
  const totalPrizePool = drawsRes.data?.reduce((s, d) => s + d.total_pool_amount, 0) || 0;
  const totalPrizesPaid = winnersRes.data?.reduce((s, w) => s + w.prize_amount, 0) || 0;
  const totalCharityContributions = contributionsRes.data?.reduce((s, c) => s + c.amount, 0) || 0;

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Subscribers', value: activeSubscribers, icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Total Prize Pool', value: formatCurrency(totalPrizePool), icon: Trophy, color: 'text-amber-600 bg-amber-50' },
    { label: 'Prizes Paid', value: formatCurrency(totalPrizesPaid), icon: Dices, color: 'text-purple-600 bg-purple-50' },
    { label: 'Charity Contributions', value: formatCurrency(totalCharityContributions), icon: Heart, color: 'text-red-600 bg-red-50' },
    { label: 'Active Charities', value: totalCharities, icon: Heart, color: 'text-teal-600 bg-teal-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
