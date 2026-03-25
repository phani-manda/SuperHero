import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/home/hero';
import { HowItWorksSection } from '@/components/home/how-it-works-section';
import { FeaturedCharities } from '@/components/home/featured-charities';
import { CTASection } from '@/components/home/cta-section';
import { Footer } from '@/components/layout/footer';

export default async function Home() {
  const supabase = createServerSupabaseClient();
  const { data: charities } = await supabase
    .from('charities')
    .select('id, name, slug, description')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('name')
    .limit(3);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorksSection />
      <FeaturedCharities charities={charities || []} />
      <CTASection />
      <Footer />
    </div>
  );
}
