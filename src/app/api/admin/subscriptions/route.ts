import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Admin only' }, { status: 403 }) };
  }

  return { supabase };
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const {
    id,
    plan_type,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
  } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (plan_type !== undefined) update.plan_type = plan_type;
  if (status !== undefined) update.status = status;
  if (current_period_start !== undefined) update.current_period_start = current_period_start;
  if (current_period_end !== undefined) update.current_period_end = current_period_end;
  if (cancel_at_period_end !== undefined) update.cancel_at_period_end = cancel_at_period_end;

  const { data, error } = await auth.supabase
    .from('subscriptions')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscription: data });
}
