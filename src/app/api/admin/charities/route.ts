import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Admin Charities API
 * PUT: Update an existing charity
 * DELETE: Delete a charity
 */

export async function PUT(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { id, name, description, slug, website_url, is_featured, is_active } = await request.json();

  if (!id) return NextResponse.json({ error: 'Charity ID required' }, { status: 400 });

  const { data, error } = await supabase
    .from('charities')
    .update({
      name,
      description,
      slug,
      website_url,
      is_featured: is_featured ?? false,
      is_active: is_active ?? true,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ charity: data });
}

export async function DELETE(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Charity ID required' }, { status: 400 });

  const { error } = await supabase
    .from('charities')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
