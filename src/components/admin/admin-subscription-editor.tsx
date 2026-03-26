'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SubscriptionRecord {
  id: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export function AdminSubscriptionEditor({
  subscription,
}: {
  subscription: SubscriptionRecord;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    plan_type: subscription.plan_type,
    status: subscription.status,
    current_period_start: subscription.current_period_start.slice(0, 10),
    current_period_end: subscription.current_period_end.slice(0, 10),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: subscription.id,
          ...form,
          current_period_start: new Date(form.current_period_start).toISOString(),
          current_period_end: new Date(form.current_period_end).toISOString(),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success('Subscription updated');
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update subscription');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-900">Manage Subscription</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan</label>
          <select
            value={form.plan_type}
            onChange={(e) => setForm({ ...form, plan_type: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
            <option value="past_due">Past Due</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Period Start</label>
            <input
              type="date"
              value={form.current_period_start}
              onChange={(e) => setForm({ ...form, current_period_start: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Period End</label>
            <input
              type="date"
              value={form.current_period_end}
              onChange={(e) => setForm({ ...form, current_period_end: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.cancel_at_period_end}
            onChange={(e) => setForm({ ...form, cancel_at_period_end: e.target.checked })}
            className="rounded border-gray-300"
          />
          Cancel at period end
        </label>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} loading={saving} className="flex-1">
            Save
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
