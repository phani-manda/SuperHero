'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Score {
  id: string;
  score: number;
  played_at: string;
  position: number;
}

interface ScoreEntryProps {
  initialScores: Score[];
}

export function ScoreEntry({ initialScores }: ScoreEntryProps) {
  const [scores, setScores] = useState<Score[]>(initialScores);
  const [newScore, setNewScore] = useState('');
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    const scoreNum = parseInt(newScore);
    if (!scoreNum || scoreNum < 1 || scoreNum > 45) {
      toast.error('Score must be between 1 and 45');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: scoreNum, playedAt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Refresh scores
      const listRes = await fetch('/api/scores');
      const listData = await listRes.json();
      setScores(listData.scores);
      setNewScore('');
      toast.success('Score added!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add score');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    const scoreNum = parseInt(editScore);
    if (!scoreNum || scoreNum < 1 || scoreNum > 45) {
      toast.error('Score must be between 1 and 45');
      return;
    }

    try {
      const res = await fetch('/api/scores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, score: scoreNum }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setScores(scores.map((s) => (s.id === id ? { ...s, score: scoreNum } : s)));
      setEditingId(null);
      toast.success('Score updated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch('/api/scores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setScores(scores.filter((s) => s.id !== id));
      toast.success('Score removed');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Your Golf Scores</h2>
        <p className="text-sm text-gray-500">
          Enter your Stableford scores (1–45). Only the latest 5 are kept.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new score */}
        <div className="flex gap-3 items-end">
          <Input
            id="score"
            label="Score"
            type="number"
            min={1}
            max={45}
            placeholder="36"
            value={newScore}
            onChange={(e) => setNewScore(e.target.value)}
            className="w-24"
          />
          <Input
            id="playedAt"
            label="Date Played"
            type="date"
            value={playedAt}
            onChange={(e) => setPlayedAt(e.target.value)}
          />
          <Button onClick={handleAdd} loading={loading} size="md">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Score list */}
        <div className="space-y-2">
          {scores.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No scores yet. Add your first score above.
            </p>
          ) : (
            scores.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-brand-700 w-12 text-center">
                    {s.score}
                  </span>
                  <span className="text-sm text-gray-500">{formatDate(s.played_at)}</span>
                </div>
                <div className="flex gap-2">
                  {editingId === s.id ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        min={1}
                        max={45}
                        value={editScore}
                        onChange={(e) => setEditScore(e.target.value)}
                        className="w-20 h-8"
                      />
                      <Button size="sm" onClick={() => handleUpdate(s.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(s.id);
                          setEditScore(String(s.score));
                        }}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {scores.length > 0 && (
          <div className="text-right text-sm text-gray-400">
            {scores.length}/5 scores entered
          </div>
        )}
      </CardContent>
    </Card>
  );
}
