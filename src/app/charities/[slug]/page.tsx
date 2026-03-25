import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Heart, Globe } from 'lucide-react';
import { CharityDonateButton } from '@/components/charities/charity-donate-button';

interface Props {
  params: { slug: string };
}

export default async function CharityPage({ params }: Props) {
  const supabase = createServerSupabaseClient();
  const { data: charity } = await supabase
    .from('charities')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!charity) notFound();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/charities"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> All Charities
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center">
            <Heart className="h-16 w-16 text-white" />
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{charity.name}</h1>
              {charity.website_url && (
                <a
                  href={charity.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-brand-600"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">{charity.description}</p>

            <div className="flex items-center gap-6 mb-8 py-4 border-y border-gray-100">
              <div>
                <p className="text-2xl font-bold text-brand-700">
                  {formatCurrency(charity.total_received)}
                </p>
                <p className="text-xs text-gray-500">Total raised</p>
              </div>
            </div>

            <CharityDonateButton charityId={charity.id} charityName={charity.name} />
          </div>
        </div>
      </div>
    </main>
  );
}
