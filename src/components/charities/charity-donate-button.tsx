'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Props {
  charityId: string;
  charityName: string;
}

export function CharityDonateButton({ charityId, charityName }: Props) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleDonate() {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/charities/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charityId, amount: num }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(`Thank you for donating to ${charityName}!`);
      setAmount('');
      setShowForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Donation failed');
    } finally {
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} size="lg">
        Make a Donation
      </Button>
    );
  }

  return (
    <div className="flex items-end gap-3">
      <Input
        id="donation"
        label="Amount (GBP)"
        type="number"
        min={1}
        step={0.01}
        placeholder="10.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-32"
      />
      <Button onClick={handleDonate} loading={loading}>
        Donate
      </Button>
      <Button variant="ghost" onClick={() => setShowForm(false)}>
        Cancel
      </Button>
    </div>
  );
}
