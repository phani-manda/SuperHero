import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatDate, formatCurrency } from '@/lib/utils';
import { DrawActions } from '@/components/admin/draw-actions';
import { DrawPublishButton } from '@/components/admin/draw-publish-button';

export default async function AdminDrawsPage() {
  const supabase = createServerSupabaseClient();

  const { data: draws } = await supabase
    .from('draws')
    .select('*')
    .order('draw_date', { ascending: false }) as any;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Draw Management</h1>
        <DrawActions />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Month</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Winning Numbers</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Pool</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Jackpot Rollover</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {draws?.map((draw: any) => (
                <tr key={draw.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{draw.draw_month}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      draw.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : draw.status === 'simulated'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {draw.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">{draw.draw_type}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {draw.winning_numbers.map((n: number, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-800 text-xs font-bold"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatCurrency(draw.total_pool_amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {draw.jackpot_rollover > 0
                      ? formatCurrency(draw.jackpot_rollover)
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(draw.draw_date)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {draw.status === 'simulated' && (
                      <DrawPublishButton drawId={draw.id} />
                    )}
                  </td>
                </tr>
              ))}
              {(!draws || draws.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No draws yet. Run a simulation to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

