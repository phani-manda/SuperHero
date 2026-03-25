import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/draws/publish — publish a simulated draw
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

  const { drawId } = await request.json();

  if (!drawId) {
    return NextResponse.json({ error: 'drawId required' }, { status: 400 });
  }

  // Verify draw exists and is in simulated state
  const { data: draw } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .eq('status', 'simulated')
    .single();

  if (!draw) {
    return NextResponse.json({ error: 'Draw not found or not in simulated state' }, { status: 404 });
  }

  // Get entries with matches >= 3
  const { data: matchedEntries } = await supabase
    .from('draw_entries')
    .select('*')
    .eq('draw_id', drawId)
    .gte('matched_count', 3);

  // Create winner records
  if (matchedEntries) {
    for (const entry of matchedEntries) {
      let matchType: '5-match' | '4-match' | '3-match';
      let pool: number;

      if (entry.matched_count === 5) {
        matchType = '5-match';
        pool = draw.five_match_pool;
      } else if (entry.matched_count === 4) {
        matchType = '4-match';
        pool = draw.four_match_pool;
      } else {
        matchType = '3-match';
        pool = draw.three_match_pool;
      }

      // Count winners in same tier
      const sameTierCount = matchedEntries.filter(
        (e) => e.matched_count === entry.matched_count
      ).length;

      const prizeAmount = Math.floor(pool / sameTierCount);

      await supabase.from('winners').insert({
        draw_id: drawId,
        user_id: entry.user_id,
        match_type: matchType,
        prize_amount: prizeAmount,
      });

      // Update entry prize amount
      await supabase
        .from('draw_entries')
        .update({ prize_amount: prizeAmount })
        .eq('id', entry.id);
    }
  }

  // Publish the draw
  const { error } = await supabase
    .from('draws')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', drawId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, winnersCount: matchedEntries?.length || 0 });
}
