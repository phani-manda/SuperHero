'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadCharityEventImage, uploadCharityMedia } from '@/lib/supabase/storage';
import {
  parseEventsInput,
  parseMediaInput,
  stringifyEventsInput,
  stringifyMediaInput,
} from '@/lib/charity-content';

interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  website_url: string | null;
  media_urls: string[] | null;
  upcoming_events: { title: string; date: string; description: string; link_url?: string | null }[] | null;
  is_featured: boolean;
  is_active: boolean;
}

export function AdminCharityActions({ charity }: { charity: Charity }) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: charity.name,
    description: charity.description,
    slug: charity.slug,
    image_url: charity.image_url || '',
    website_url: charity.website_url || '',
    media_urls: stringifyMediaInput(charity.media_urls),
    upcoming_events: stringifyEventsInput(charity.upcoming_events),
    is_featured: charity.is_featured,
    is_active: charity.is_active,
  });

  async function handleUpdate() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/charities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: charity.id,
          ...form,
          media_urls: parseMediaInput(form.media_urls),
          upcoming_events: parseEventsInput(form.upcoming_events),
        }),
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
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
          <Input
            id={`edit-image-url-${charity.id}`}
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
                const { url, error } = await uploadCharityEventImage(supabase, form.slug, file);
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
                  const { url, error } = await uploadCharityMedia(supabase, form.slug, file);
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
