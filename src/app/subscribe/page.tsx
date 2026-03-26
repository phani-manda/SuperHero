'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import Script from 'next/script';

declare global {
  interface Window {
    Cashfree: any;
  }
}

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '₹999',
    period: '/month',
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
    price: '₹8,999',
    period: '/year',
    badge: 'Save 25%',
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

  const cashfreeEnv = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production'
    ? 'production'
    : 'sandbox';

  async function handleSubscribe() {
    setLoading(true);

    try {
      // Create order on backend
      const res = await fetch('/api/cashfree/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: selected }),
      });

      const data = await res.json();

      if (data.error) {
        if (res.status === 401) {
          router.push('/auth/signup');
          return;
        }
        throw new Error(data.error);
      }

      // Initialize Cashfree checkout
      const cashfree = await window.Cashfree({ mode: cashfreeEnv });

      const checkoutOptions = {
        paymentSessionId: data.paymentSessionId,
        redirectTarget: '_self',
      };

      await cashfree.checkout(checkoutOptions);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="lazyOnload"
      />
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

          <div className="mt-8 text-center space-y-3">
            <Button size="lg" onClick={handleSubscribe} loading={loading} className="px-12">
              Subscribe Now
            </Button>
            <p className="text-sm text-gray-400">
              Cancel anytime. Secure payment via Cashfree.
            </p>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-xs text-gray-400 mb-2">For demo / interviewer testing:</p>
              <Button
                variant="outline"
                size="md"
                loading={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await fetch('/api/subscriptions/demo', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ planType: selected }),
                    });
                    const data = await res.json();
                    if (data.error) {
                      if (res.status === 401) { router.push('/auth/signup'); return; }
                      throw new Error(data.error);
                    }
                    toast.success(data.message || 'Demo subscription activated!');
                    router.push('/dashboard');
                  } catch (err: unknown) {
                    toast.error(err instanceof Error ? err.message : 'Demo failed');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Demo Subscribe (No Payment)
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
