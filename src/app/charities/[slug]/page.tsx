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
          <div className="h-48 bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center overflow-hidden">
            {charity.image_url ? (
              <img src={charity.image_url} alt={charity.name} className="h-full w-full object-cover" />
            ) : (
              <Heart className="h-16 w-16 text-white" />
            )}
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

            {Array.isArray(charity.upcoming_events) && charity.upcoming_events.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Events</h2>
                <div className="space-y-3">
                  {charity.upcoming_events.map((event: any, index: number) => (
                    <div key={`${event.title}-${index}`} className="rounded-lg border border-gray-100 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-500">{event.date}</p>
                        </div>
                        {event.link_url && (
                          <a
                            href={event.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-brand-600 hover:underline"
                          >
                            Learn more
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(charity.media_urls) && charity.media_urls.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Media Gallery</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {charity.media_urls.map((url: string, index: number) => (
                    <a
                      key={`${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50"
                    >
                      {url.endsWith('.mp4') ? (
                        <video src={url} controls className="h-48 w-full object-cover" />
                      ) : (
                        <img src={url} alt={`${charity.name} media ${index + 1}`} className="h-48 w-full object-cover" />
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <CharityDonateButton charityId={charity.id} charityName={charity.name} />
          </div>
        </div>
      </div>
    </main>
  );
}
