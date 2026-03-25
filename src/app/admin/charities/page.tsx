import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { AdminCharityForm } from '@/components/admin/admin-charity-form';

export default async function AdminCharitiesPage() {
  const supabase = createServerSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .order('name') as any;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Charity Management</h1>
        <AdminCharityForm />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {charities?.map((charity: any) => (
          <div
            key={charity.id}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{charity.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {charity.description}
                </p>
              </div>
              <div className="flex gap-2">
                {charity.is_featured && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  charity.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {charity.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-brand-600 font-medium">
                {formatCurrency(charity.total_received)} raised
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
