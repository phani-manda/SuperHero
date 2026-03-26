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
    full_name,
    email,
    role,
    selected_charity_id,
    charity_percentage,
  } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (full_name !== undefined) update.full_name = full_name || null;
  if (email !== undefined) update.email = email;
  if (role !== undefined) update.role = role;
  if (selected_charity_id !== undefined) update.selected_charity_id = selected_charity_id || null;
  if (charity_percentage !== undefined) update.charity_percentage = charity_percentage;

  const { data, error } = await auth.supabase
    .from('profiles')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
