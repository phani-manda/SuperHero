'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export function SubscriptionCard({ subscription }: { subscription: Subscription | null }) {
  const [canceling, setCanceling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    setCanceling(true);
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(data.message || 'Subscription will be canceled at period end');
      setShowConfirm(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Cancel failed');
    } finally {
      setCanceling(false);
    }
  }

  if (!subscription) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">No Active Subscription</p>
              <p className="text-sm text-amber-700 mt-1">
                Subscribe to enter draws and track your scores.
              </p>
              <Link href="/subscribe">
                <Button size="sm" className="mt-3">Subscribe Now</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    canceled: 'bg-red-100 text-red-800',
    past_due: 'bg-amber-100 text-amber-800',
    incomplete: 'bg-gray-100 text-gray-800',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand-600" />
            Subscription
          </h2>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[subscription.status as keyof typeof statusColors] || 'bg-gray-100'}`}>
            {subscription.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Plan</span>
            <span className="font-medium capitalize">{subscription.plan_type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Renews</span>
            <span className="font-medium">{formatDate(subscription.current_period_end)}</span>
          </div>
          {subscription.cancel_at_period_end && (
            <p className="text-sm text-amber-600">
              Cancels at end of current period
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <Link href="/subscribe" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                Renew / Change Plan
              </Button>
            </Link>
            {!subscription.cancel_at_period_end && (
              <>
                {showConfirm ? (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      loading={canceling}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirm(false)}
                    >
                      No
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirm(true)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

