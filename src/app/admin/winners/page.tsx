import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { WinnerVerifyActions } from '@/components/admin/winner-verify-actions';

export default async function AdminWinnersPage() {
  const supabase = createServerSupabaseClient();

  const { data: winners } = await supabase
    .from('winners')
    .select('*, profiles(full_name, email), draws(draw_month)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Winner Management</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Draw</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Match</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Prize</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Verification</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Proof</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {winners?.map((winner) => (
                <tr key={winner.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {(winner.profiles as { full_name: string })?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(winner.profiles as { email: string })?.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {(winner.draws as { draw_month: string })?.draw_month}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-brand-100 text-brand-800">
                      {winner.match_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatCurrency(winner.prize_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      winner.verification_status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : winner.verification_status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {winner.verification_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      winner.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {winner.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {winner.proof_url ? (
                      <a
                        href={winner.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:underline text-xs"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <WinnerVerifyActions
                      winnerId={winner.id}
                      currentStatus={winner.verification_status}
                      paymentStatus={winner.payment_status}
                    />
                  </td>
                </tr>
              ))}
              {(!winners || winners.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No winners yet.
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
