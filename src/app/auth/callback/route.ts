import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const metadata = user.user_metadata || {};
        const update: Record<string, unknown> = {};

        if (typeof metadata.full_name === 'string' && metadata.full_name.trim().length > 0) {
          update.full_name = metadata.full_name.trim();
        }

        if (typeof metadata.selected_charity_id === 'string' && metadata.selected_charity_id.trim().length > 0) {
          update.selected_charity_id = metadata.selected_charity_id.trim();
        }

        const percentage = Number(metadata.charity_percentage);
        if (Number.isFinite(percentage) && percentage >= 10 && percentage <= 100) {
          update.charity_percentage = percentage;
        }

        if (Object.keys(update).length > 0) {
          await supabase.from('profiles').update(update).eq('id', user.id);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`);
}
