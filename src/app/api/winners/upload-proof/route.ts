import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { winnerId, proofUrl } = await request.json();

  if (!winnerId || !proofUrl) {
    return NextResponse.json(
      { error: 'Winner ID and proof URL required' },
      { status: 400 }
    );
  }

  // Verify winner belongs to user
  const { data: winner, error: fetchError } = await supabase
    .from('winners')
    .select('user_id, verification_status')
    .eq('id', winnerId)
    .single() as any;

  if (fetchError || !winner) {
    return NextResponse.json({ error: 'Winner not found' }, { status: 404 });
  }

  if (winner.user_id !== user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  // Update winner with proof URL
  const { error: updateError } = await supabase
    .from('winners')
    .update({ proof_url: proofUrl })
    .eq('id', winnerId);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
