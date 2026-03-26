import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/env';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/seed
 * Seeds an admin account for interviewer testing.
 * Tries admin API first (requires valid service role key), falls back to signup.
 */
export async function GET() {
  const ADMIN_EMAIL = 'admin@golfgives.com';
  const ADMIN_PASSWORD = 'Admin@123456';

  try {
    const supabaseUrl = getSupabaseUrl();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const anonKey = getSupabaseAnonKey();

    // Determine if service role key looks like a valid JWT
    const isValidServiceKey = serviceRoleKey.startsWith('eyJ') && serviceRoleKey.length > 100;

    if (isValidServiceKey) {
      // Use service role key — can create confirmed users
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Check if admin already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const adminExists = existingUsers?.users?.find(
        (u) => u.email === ADMIN_EMAIL
      );

      if (adminExists) {
        await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', adminExists.id);

        return NextResponse.json({
          message: 'Admin account already exists',
          credentials: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
        });
      }

      // Create confirmed admin user
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: 'Platform Admin' },
        });

      if (createError || !newUser.user) {
        throw createError || new Error('Failed to create admin user');
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await supabase
        .from('profiles')
        .update({ role: 'admin', full_name: 'Platform Admin' })
        .eq('id', newUser.user.id);

      return NextResponse.json({
        message: 'Admin account created successfully (email auto-confirmed)',
        credentials: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      });
    }

    // Fallback: use anon key with signup
    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try to sign in first
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (signInData?.user) {
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', signInData.user.id);
      return NextResponse.json({
        message: 'Admin account already exists and role verified',
        credentials: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      });
    }

    // Create via signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: { data: { full_name: 'Platform Admin' } },
    });

    if (signUpError) throw signUpError;
    if (!signUpData.user) throw new Error('Failed to create admin user');

    // Wait for profile trigger
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Try signing in to set role
    const { data: session } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (session?.user) {
      await supabase.from('profiles').update({ role: 'admin', full_name: 'Platform Admin' }).eq('id', session.user.id);
    }

    return NextResponse.json({
      message: 'Admin account created. If email confirmation is enabled in Supabase, please disable it in Dashboard > Authentication > Providers > Email, or confirm the user manually.',
      credentials: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      setupInstructions: [
        '1. Go to your Supabase Dashboard > Authentication > Providers > Email',
        '2. Disable "Confirm email" toggle',
        '3. Visit this endpoint again (/api/admin/seed) to verify',
        '4. Or manually confirm the user in Supabase Dashboard > Authentication > Users',
      ],
    });
  } catch (err: unknown) {
    console.error('Admin seed error:', err);
    const message = err instanceof Error ? err.message : 'Seed failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

