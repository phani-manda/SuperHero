'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function DrawActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [drawMonth, setDrawMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random');

  async function handleSimulate() {
    setLoading(true);
    try {
      const res = await fetch('/api/draws/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawMonth, drawType }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success(
        `Simulation complete! ${data.simulation.winners.length} winner(s) found.`
      );
      router.refresh();
      setShowForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(drawId: string) {
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
    }
  }

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)}>
        New Simulation
      </Button>
    );
  }

  return (
    <div className="flex items-end gap-3 bg-white p-4 rounded-lg border border-gray-200">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
        <input
          type="month"
          value={drawMonth}
          onChange={(e) => setDrawMonth(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
        <select
          value={drawType}
          onChange={(e) => setDrawType(e.target.value as 'random' | 'algorithmic')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="random">Random</option>
          <option value="algorithmic">Algorithmic</option>
        </select>
      </div>
      <Button onClick={handleSimulate} loading={loading}>
        Run Simulation
      </Button>
      <Button variant="ghost" onClick={() => setShowForm(false)}>
        Cancel
      </Button>
    </div>
  );
}
