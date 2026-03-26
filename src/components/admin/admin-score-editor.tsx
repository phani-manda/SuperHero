'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, X } from 'lucide-react';

interface Score {
  id: string;
  score: number;
  played_at: string;
  position: number;
}

export function AdminScoreEditor({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState('');

  async function loadScores() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/scores?userId=${userId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScores(data.scores);
      setOpen(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load scores');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    const num = parseInt(editScore);
    if (!num || num < 1 || num > 45) {
      toast.error('Score must be between 1 and 45');
      return;
    }
    try {
      const res = await fetch('/api/admin/scores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, score: num }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScores(scores.map(s => s.id === id ? { ...s, score: num } : s));
      setEditingId(null);
      toast.success('Score updated');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={loadScores} loading={loading} title="View Scores">
        <Eye className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Scores — {userName}</h2>
          <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        {scores.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No scores entered.</p>
        ) : (
          <div className="space-y-2">
            {scores.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-brand-700 w-10 text-center">{s.score}</span>
                  <span className="text-xs text-gray-500">{s.played_at}</span>
                </div>
                {editingId === s.id ? (
                  <div className="flex gap-1 items-center">
                    <Input
                      type="number"
                      min={1}
                      max={45}
                      value={editScore}
                      onChange={(e) => setEditScore(e.target.value)}
                      className="w-16 h-7 text-sm"
                    />
                    <Button size="sm" onClick={() => handleUpdate(s.id)}>OK</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>×</Button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingId(s.id); setEditScore(String(s.score)); }}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
