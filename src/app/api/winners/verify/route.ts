import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/winners/verify — upload proof or admin verify
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { winnerId, action, proofUrl } = await request.json();

  if (!winnerId) {
    return NextResponse.json({ error: 'winnerId required' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  if (action === 'upload_proof') {
    // User uploads proof screenshot
    const { error } = await supabase
      .from('winners')
      .update({ proof_url: proofUrl })
      .eq('id', winnerId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  if (action === 'approve') {
    const { error } = await supabase
      .from('winners')
      .update({ verification_status: 'approved' })
      .eq('id', winnerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (action === 'reject') {
    const { error } = await supabase
      .from('winners')
      .update({ verification_status: 'rejected' })
      .eq('id', winnerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (action === 'mark_paid') {
    const { error } = await supabase
      .from('winners')
      .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', winnerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
