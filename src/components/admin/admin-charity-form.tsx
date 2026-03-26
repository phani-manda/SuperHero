'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { uploadCharityEventImage, uploadCharityMedia } from '@/lib/supabase/storage';
import { parseEventsInput, parseMediaInput } from '@/lib/charity-content';

export function AdminCharityForm() {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    website_url: '',
    image_url: '',
    media_urls: '',
    upcoming_events: '',
    is_featured: false,
  });

  const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  async function handleSubmit() {
    if (!form.name || !form.description) {
      toast.error('Name and description required');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/admin/charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        slug,
        description: form.description,
        website_url: form.website_url || null,
        image_url: form.image_url || null,
        media_urls: parseMediaInput(form.media_urls),
        upcoming_events: parseEventsInput(form.upcoming_events),
        is_featured: form.is_featured,
        is_active: true,
      }),
    });

    const data = await res.json();

    if (data.error) {
      toast.error(data.error);
    } else {
      toast.success('Charity added');
      setForm({
        name: '',
        description: '',
        website_url: '',
        image_url: '',
        media_urls: '',
        upcoming_events: '',
        is_featured: false,
      });
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
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto">
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
        <Input
          id="image-url"
          label="Cover Image URL"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Upload Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setLoading(true);
              const { url, error } = await uploadCharityEventImage(supabase, slug || 'charity', file);
              setLoading(false);
              if (error) return toast.error(error.message);
              setForm((current) => ({ ...current, image_url: url || '' }));
              toast.success('Cover image uploaded');
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Gallery Media URLs</label>
          <textarea
            value={form.media_urls}
            onChange={(e) => setForm({ ...form, media_urls: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            rows={3}
            placeholder="One URL per line"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Upload Gallery Media</label>
          <input
            type="file"
            accept="image/*,video/mp4"
            multiple
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              if (files.length === 0) return;
              setLoading(true);
              const uploaded: string[] = [];
              for (const file of files) {
                const { url, error } = await uploadCharityMedia(supabase, slug || 'charity', file);
                if (error) {
                  setLoading(false);
                  return toast.error(error.message);
                }
                if (url) uploaded.push(url);
              }
              setLoading(false);
              setForm((current) => ({
                ...current,
                media_urls: [...parseMediaInput(current.media_urls), ...uploaded].join('\n'),
              }));
              toast.success('Gallery media uploaded');
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Upcoming Events</label>
          <textarea
            value={form.upcoming_events}
            onChange={(e) => setForm({ ...form, upcoming_events: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            rows={4}
            placeholder="YYYY-MM-DD | Event title | Description | Optional link"
          />
        </div>
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
