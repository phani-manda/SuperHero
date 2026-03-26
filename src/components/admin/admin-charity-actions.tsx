'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';

interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  website_url: string | null;
  is_featured: boolean;
  is_active: boolean;
}

export function AdminCharityActions({ charity }: { charity: Charity }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: charity.name,
    description: charity.description,
    slug: charity.slug,
    website_url: charity.website_url || '',
    is_featured: charity.is_featured,
    is_active: charity.is_active,
  });

  async function handleUpdate() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/charities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: charity.id, ...form }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success('Charity updated');
      setEditing(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${charity.name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/charities', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: charity.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success('Charity deleted');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditing(false)}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-lg font-semibold">Edit Charity</h2>
          <Input
            id={`edit-name-${charity.id}`}
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <Input
            id={`edit-website-${charity.id}`}
            label="Website URL"
            value={form.website_url}
            onChange={(e) => setForm({ ...form, website_url: e.target.value })}
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="rounded border-gray-300"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              Active
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleUpdate} loading={loading} className="flex-1">Save</Button>
            <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => setEditing(true)}
        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={handleDelete}
        className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
