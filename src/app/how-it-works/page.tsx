import { Navbar } from '@/components/layout/navbar';
import { HowItWorksSection } from '@/components/home/how-it-works-section';
import { CTASection } from '@/components/home/cta-section';
import { Footer } from '@/components/layout/footer';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="py-12 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How GolfGives Works</h1>
          <p className="text-lg text-gray-500">
            A simple platform that turns your golf scores into prizes and charitable impact.
          </p>
        </div>
      </div>

      <HowItWorksSection />

      {/* Draw mechanics detail */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Draw System</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Each month, 5 winning numbers are generated (range 1–45, matching the Stableford score range).
              Your latest 5 scores are compared against these numbers.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { match: '5-Match', share: '40%', desc: 'All 5 scores match — the Jackpot! Rolls over if unclaimed.' },
                { match: '4-Match', share: '35%', desc: '4 of 5 scores match. Split equally among all 4-match winners.' },
                { match: '3-Match', share: '25%', desc: '3 of 5 scores match. Split equally among all 3-match winners.' },
              ].map((tier) => (
                <div key={tier.match} className="rounded-xl border border-gray-200 p-4">
                  <p className="font-bold text-brand-700 text-lg">{tier.match}</p>
                  <p className="text-accent-600 font-semibold text-sm">{tier.share} of prize pool</p>
                  <p className="text-xs text-gray-500 mt-2">{tier.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Charity Impact</h2>
            <p className="text-gray-600 leading-relaxed">
              A minimum of 10% of every subscription goes directly to your chosen charity.
              You can increase this percentage at any time from your dashboard.
              You can also make independent one-off donations to any charity in our directory.
            </p>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
}
