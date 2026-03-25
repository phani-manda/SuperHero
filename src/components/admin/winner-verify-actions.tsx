'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
  winnerId: string;
  currentStatus: string;
  paymentStatus: string;
}

export function WinnerVerifyActions({ winnerId, currentStatus, paymentStatus }: Props) {
  const router = useRouter();

  async function handleAction(action: string) {
    try {
      const res = await fetch('/api/winners/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId, action }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(`Winner ${action === 'mark_paid' ? 'marked as paid' : action + 'd'}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
  }

  return (
    <div className="flex gap-1">
      {currentStatus === 'pending' && (
        <>
          <Button size="sm" variant="ghost" onClick={() => handleAction('approve')}>
            Approve
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleAction('reject')}>
            Reject
          </Button>
        </>
      )}
      {currentStatus === 'approved' && paymentStatus === 'pending' && (
        <Button size="sm" onClick={() => handleAction('mark_paid')}>
          Mark Paid
        </Button>
      )}
    </div>
  );
}
