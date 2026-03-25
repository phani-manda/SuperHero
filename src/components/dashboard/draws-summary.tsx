'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Trophy, Calendar } from 'lucide-react';

interface DrawEntry {
  id: string;
  draw_id: string;
  scores_snapshot: number[];
  matched_count: number;
  prize_amount: number;
  draws: {
    draw_month: string;
    winning_numbers: number[];
    status: string;
    draw_date: string;
  };
}

interface Winner {
  id: string;
  match_type: string;
  prize_amount: number;
  verification_status: string;
  payment_status: string;
}

interface Props {
  entries: DrawEntry[];
  winners: Winner[];
}

export function DrawsSummary({ entries, winners }: Props) {
  const totalWon = winners.reduce((sum, w) => sum + w.prize_amount, 0);
  const pendingPayouts = winners.filter((w) => w.payment_status === 'pending' && w.verification_status === 'approved');

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent-500" />
          Draws & Winnings
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
            <p className="text-xs text-gray-500">Draws Entered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-700">{winners.length}</p>
            <p className="text-xs text-gray-500">Wins</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-600">{formatCurrency(totalWon)}</p>
            <p className="text-xs text-gray-500">Total Won</p>
          </div>
        </div>

        {/* Pending payouts */}
        {pendingPayouts.length > 0 && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
            <p className="text-sm text-green-800 font-medium">
              {pendingPayouts.length} payout(s) pending
            </p>
          </div>
        )}

        {/* Recent entries */}
        {entries.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Recent Draws</p>
            {entries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {entry.draws.draw_month}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {entry.matched_count} matches
                  </span>
                  {entry.prize_amount > 0 && (
                    <span className="text-xs font-medium text-brand-700">
                      {formatCurrency(entry.prize_amount)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            No draw entries yet. Enter 5 scores to participate.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
