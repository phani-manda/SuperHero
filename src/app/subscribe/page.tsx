'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '£9.99',
    period: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
    features: [
      'Enter your golf scores',
      'Monthly prize draw entry',
      '10% to your chosen charity',
      'Full dashboard access',
      'Winner verification & payouts',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '£89.99',
    period: '/year',
    badge: 'Save 25%',
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || 'price_yearly',
    features: [
      'Everything in Monthly',
      '2 months free',
      'Priority support',
      'Early draw notifications',
      'Exclusive yearly member badge',
    ],
  },
];

export default function SubscribePage() {
  const router = useRouter();
  const [selected, setSelected] = useState('yearly');
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    const plan = plans.find((p) => p.id === selected)!;

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.priceId, planType: plan.id }),
      });

      const data = await res.json();

      if (data.error) {
        if (res.status === 401) {
          router.push('/auth/signup');
          return;
        }
        throw new Error(data.error);
      }

      window.location.href = data.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Plan</h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Subscribe to enter monthly draws, track your scores, and support a charity you believe in.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'relative p-6 cursor-pointer transition-all hover:shadow-md',
                selected === plan.id && 'ring-2 ring-brand-600 shadow-md'
              )}
              onClick={() => setSelected(plan.id)}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="ml-1 text-gray-500">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button size="lg" onClick={handleSubscribe} loading={loading} className="px-12">
            Subscribe Now
          </Button>
          <p className="mt-3 text-sm text-gray-400">
            Cancel anytime. Secure payment via Stripe.
          </p>
        </div>
      </div>
    </main>
  );
}
