import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/subscriptions/cancel
 *
 * Allows users to cancel their subscription
 * Sets cancel_at_period_end to true (subscription remains active until period ends)
 */
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's active subscription
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (fetchError || !subscription) {
    return NextResponse.json(
      { error: 'No active subscription found' },
      { status: 404 }
    );
  }

  // Check if already set to cancel
  if (subscription.cancel_at_period_end) {
    return NextResponse.json(
      {
        message: 'Subscription already set to cancel',
        subscription: {
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: true,
        },
      }
    );
  }

  // Set cancel_at_period_end flag
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({ cancel_at_period_end: true })
    .eq('id', subscription.id);

  if (updateError) {
    console.error('Error canceling subscription:', updateError);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: 'Subscription will be canceled at period end',
    subscription: {
      id: subscription.id,
      planType: subscription.plan_type,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: true,
    },
  });
}
