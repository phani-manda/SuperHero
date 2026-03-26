'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

interface CharityOption {
  id: string;
  name: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  selected_charity_id: string | null;
  charity_percentage: number;
}

export function AdminProfileEditor({ user }: { user: UserProfile }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [charities, setCharities] = useState<CharityOption[]>([]);
  const [form, setForm] = useState({
    full_name: user.full_name || '',
    email: user.email,
    role: user.role,
    selected_charity_id: user.selected_charity_id || '',
    charity_percentage: user.charity_percentage,
  });

  useEffect(() => {
    if (!open) return;

    async function loadCharities() {
      const res = await fetch('/api/charities');
      const data = await res.json();
      setCharities(data.charities || []);
    }

    loadCharities();
  }, [open]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          ...form,
          selected_charity_id: form.selected_charity_id || null,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success('Profile updated');
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
        Edit Profile
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-900">Edit User Profile</h2>

        <Input
          id={`admin-profile-name-${user.id}`}
          label="Full Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />

        <Input
          id={`admin-profile-email-${user.id}`}
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Selected Charity</label>
          <select
            value={form.selected_charity_id}
            onChange={(e) => setForm({ ...form, selected_charity_id: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">No charity selected</option>
            {charities.map((charity) => (
              <option key={charity.id} value={charity.id}>
                {charity.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Charity Percentage: {form.charity_percentage}%
          </label>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={form.charity_percentage}
            onChange={(e) => setForm({ ...form, charity_percentage: Number(e.target.value) })}
            className="w-full accent-brand-600"
          />
        </div>

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
