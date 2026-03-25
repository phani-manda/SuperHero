'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface Charity {
  id: string;
  name: string;
}

interface Props {
  userId: string;
  currentCharityId: string | null;
  currentPercentage: number;
}

export function CharitySelector({ userId, currentCharityId, currentPercentage }: Props) {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedId, setSelectedId] = useState(currentCharityId || '');
  const [percentage, setPercentage] = useState(currentPercentage);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('charities')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (data) setCharities(data);
    }
    load();
  }, [supabase]);

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          selected_charity_id: selectedId || null,
          charity_percentage: percentage,
        })
        .eq('id', userId);

      if (error) throw error;
      toast.success('Charity preferences updated');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Your Charity
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Selected Charity
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Choose a charity...</option>
            {charities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Contribution: {percentage}%
          </label>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={percentage}
            onChange={(e) => setPercentage(parseInt(e.target.value))}
            className="w-full accent-brand-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10% min</span>
            <span>100%</span>
          </div>
        </div>

        <Button size="sm" onClick={handleSave} loading={saving} className="w-full">
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}
