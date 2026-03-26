'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
  drawId: string;
}

export function DrawPublishButton({ drawId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePublish() {
    if (!confirm('Are you sure you want to publish this draw? This will create winner records and cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/draws/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(`Draw published with ${data.winnersCount} winner(s)`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={handlePublish} loading={loading}>
      Publish
    </Button>
  );
}
