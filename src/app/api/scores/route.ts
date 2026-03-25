import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/scores — fetch user's scores
export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: scores, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('played_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ scores });
}

// POST /api/scores — add a new score (rolling 5 window handled by DB trigger)
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!subscription) {
    return NextResponse.json({ error: 'Active subscription required' }, { status: 403 });
  }

  const { score, playedAt } = await request.json();

  if (!score || !playedAt) {
    return NextResponse.json({ error: 'Score and date are required' }, { status: 400 });
  }

  if (score < 1 || score > 45) {
    return NextResponse.json({ error: 'Score must be between 1 and 45 (Stableford)' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('scores')
    .insert({
      user_id: user.id,
      score,
      played_at: playedAt,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ score: data }, { status: 201 });
}

// PUT /api/scores — update a score
export async function PUT(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, score, playedAt } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Score ID required' }, { status: 400 });
  }

  if (score !== undefined && (score < 1 || score > 45)) {
    return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (score !== undefined) updateData.score = score;
  if (playedAt !== undefined) updateData.played_at = playedAt;

  const { data, error } = await supabase
    .from('scores')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ score: data });
}

// DELETE /api/scores — delete a score
export async function DELETE(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  const { error } = await supabase
    .from('scores')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
