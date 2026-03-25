import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CharityList } from '@/components/charities/charity-list';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function CharitiesPage() {
  const supabase = createServerSupabaseClient();
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('name');

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Charity Directory</h1>
          <p className="text-gray-500 max-w-xl">
            Choose a charity to support with your subscription. A minimum of 10% of
            your fee goes directly to your chosen cause.
          </p>
        </div>

        <CharityList charities={charities || []} />
      </div>
    </main>
  );
}
