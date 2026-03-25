import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/charities/donate — independent donation
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { charityId, amount } = await request.json();

  if (!charityId || !amount || amount <= 0) {
    return NextResponse.json({ error: 'Valid charity and amount required' }, { status: 400 });
  }

  const amountInPence = Math.round(amount * 100);

  const { error } = await supabase.from('charity_contributions').insert({
    user_id: user.id,
    charity_id: charityId,
    amount: amountInPence,
    source: 'donation',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update charity total
  const { data: charity } = await supabase
    .from('charities')
    .select('total_received')
    .eq('id', charityId)
    .single();

  if (charity) {
    await supabase
      .from('charities')
      .update({ total_received: charity.total_received + amountInPence })
      .eq('id', charityId);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
