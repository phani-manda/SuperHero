import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { AdminSubscriptionEditor } from '@/components/admin/admin-subscription-editor';

export default async function AdminSubscriptionsPage() {
  const supabase = createServerSupabaseClient();
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false }) as any;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription Management</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Renewal</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cancel Flag</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions?.map((subscription: any) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {(subscription.profiles as { full_name?: string } | null)?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(subscription.profiles as { email?: string } | null)?.email || 'No email'}
                    </p>
                  </td>
                  <td className="px-4 py-3 capitalize">{subscription.plan_type}</td>
                  <td className="px-4 py-3 capitalize">{subscription.status}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(subscription.current_period_end)}</td>
                  <td className="px-4 py-3">
                    {subscription.cancel_at_period_end ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminSubscriptionEditor subscription={subscription} />
                  </td>
                </tr>
              ))}
              {(!subscriptions || subscriptions.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No subscriptions yet.
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
