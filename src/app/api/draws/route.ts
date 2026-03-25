import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/draws — list draws (published for users, all for admins)
export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('draws')
    .select('*')
    .order('draw_date', { ascending: false });

  // Non-admins only see published draws
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      query = query.eq('status', 'published');
    }
  } else {
    query = query.eq('status', 'published');
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ draws: data });
}
