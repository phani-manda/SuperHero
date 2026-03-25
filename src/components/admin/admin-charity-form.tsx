'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export function AdminCharityForm() {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    website_url: '',
    is_featured: false,
  });

  async function handleSubmit() {
    if (!form.name || !form.description) {
      toast.error('Name and description required');
      return;
    }

    setLoading(true);
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { error } = await supabase.from('charities').insert({
      name: form.name,
      slug,
      description: form.description,
      website_url: form.website_url || null,
      is_featured: form.is_featured,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Charity added');
      setForm({ name: '', description: '', website_url: '', is_featured: false });
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="h-4 w-4" /> Add Charity
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold">Add Charity</h2>
        <Input
          id="name"
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
          id="website"
          label="Website URL"
          value={form.website_url}
          onChange={(e) => setForm({ ...form, website_url: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
            className="rounded border-gray-300"
          />
          Featured charity
        </label>
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSubmit} loading={loading} className="flex-1">Save</Button>
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
        </div>
      </div>
    </div>
  );
}
