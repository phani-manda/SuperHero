import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendSubscriptionActivatedEmail } from '@/lib/notifications';

/**
 * POST /api/subscriptions/demo
 * Creates a demo subscription for testing without real payment.
 * Allows interviewers to test the full platform flow.
 */
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { planType = 'monthly' } = await request.json();

  if (!['monthly', 'yearly'].includes(planType)) {
    return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .single() as any;

  // Check for existing active subscription
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json({
      message: 'Already have an active subscription',
    });
  }

  // Calculate period dates
  const now = new Date();
  const periodEnd = new Date(now);
  if (planType === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  // Create demo subscription
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      payment_order_id: `demo_${user.id.slice(0, 8)}_${Date.now()}`,
      plan_type: planType,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Demo subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sendSubscriptionActivatedEmail({
    email: profile?.email || user.email || '',
    fullName: profile?.full_name || user.user_metadata?.full_name,
    planType,
    renewalDate: periodEnd.toDateString(),
  });

  return NextResponse.json({
    message: 'Demo subscription created!',
    subscription,
  });
}
