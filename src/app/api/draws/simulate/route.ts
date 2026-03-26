import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { executeDraw } from '@/lib/draw/engine';

// POST /api/draws/simulate — admin-only draw simulation
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { drawMonth, drawType = 'random' } = await request.json();

  if (!drawMonth) {
    return NextResponse.json({ error: 'drawMonth required (YYYY-MM)' }, { status: 400 });
  }

  // Get all active subscribers with 5 scores
  const { data: activeSubscribers } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active');

  if (!activeSubscribers || activeSubscribers.length === 0) {
    return NextResponse.json({ error: 'No active subscribers' }, { status: 400 });
  }

  const userIds = activeSubscribers.map((s) => s.user_id);

  // Get scores for each subscriber
  const entries: { userId: string; scores: number[] }[] = [];
  for (const userId of userIds) {
    const { data: scores } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(5);

    if (scores && scores.length === 5) {
      entries.push({
        userId,
        scores: scores.map((s) => s.score),
      });
    }
  }

  if (entries.length === 0) {
    return NextResponse.json({ error: 'No eligible entries (need 5 scores)' }, { status: 400 });
  }

  // Calculate total pool (placeholder: subscriber count * pool contribution per subscriber)
  const poolPerSubscriber = 500; // £5.00 per subscriber to prize pool
  const totalPool = entries.length * poolPerSubscriber;

  // Get previous jackpot rollover
  const { data: previousDraw } = await supabase
    .from('draws')
    .select('id, jackpot_rollover, five_match_pool')
    .eq('status', 'published')
    .order('draw_date', { ascending: false })
    .limit(1)
    .single();

  // Check if previous draw had no 5-match winners
  let rollover = 0;
  if (previousDraw) {
    const { data: prevWinners } = await supabase
      .from('winners')
      .select('id')
      .eq('draw_id', previousDraw.id)
      .eq('match_type', '5-match')
      .limit(1);

    if (!prevWinners || prevWinners.length === 0) {
      rollover = previousDraw.five_match_pool + previousDraw.jackpot_rollover;
    }
  }

  // Get score frequencies for algorithmic mode
  let scoreFrequencies;
  if (drawType === 'algorithmic') {
    const { data: freqData } = await supabase.rpc('get_score_frequencies');
    scoreFrequencies = freqData;
  }

  // Run simulation
  const result = executeDraw(entries, totalPool, drawType, scoreFrequencies, rollover);

  // Save as simulated draw
  const { data: draw, error } = await supabase
    .from('draws')
    .insert({
      draw_month: drawMonth,
      status: 'simulated',
      draw_type: drawType,
      winning_numbers: result.winningNumbers,
      total_pool_amount: totalPool,
      five_match_pool: result.poolBreakdown.fiveMatch,
      four_match_pool: result.poolBreakdown.fourMatch,
      three_match_pool: result.poolBreakdown.threeMatch,
      jackpot_rollover: result.winners.some((w) => w.matchType === '5-match') ? 0 : result.poolBreakdown.fiveMatch,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Save draw entries
  for (const entry of result.entries) {
    await supabase.from('draw_entries').insert({
      draw_id: draw.id,
      user_id: entry.userId,
      scores_snapshot: entry.scoresSnapshot,
      matched_count: entry.matchedCount,
    });
  }

  return NextResponse.json({
    draw,
    simulation: {
      totalEntries: entries.length,
      winningNumbers: result.winningNumbers,
      winners: result.winners,
      poolBreakdown: result.poolBreakdown,
    },
  });
}
