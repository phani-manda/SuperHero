import { NextResponse } from 'next/server';
import { getCashfree, PLAN_CONFIG } from '@/lib/cashfree';
import { getAppUrl } from '@/lib/env';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const appUrl = getAppUrl();
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');

  if (!orderId) {
    return NextResponse.redirect(`${appUrl}/subscribe?error=missing_order`);
  }

  try {
    const cashfree = getCashfree();
    const response = await cashfree.PGOrderFetchPayments(orderId);
    const payments = response.data as any[];

    const successfulPayment = payments?.find(
      (p: any) => p.payment_status === 'SUCCESS'
    );

    if (!successfulPayment) {
      return NextResponse.redirect(
        `${appUrl}/subscribe?error=payment_failed`
      );
    }

    // Fetch order details for metadata
    const orderResponse = await cashfree.PGFetchOrder(orderId);
    const order = orderResponse.data as any;
    const userId = order.order_tags?.user_id;
    const planType = (order.order_tags?.plan_type || 'monthly') as keyof typeof PLAN_CONFIG;

    if (!userId) {
      return NextResponse.redirect(
        `${appUrl}/subscribe?error=invalid_order`
      );
    }

    const supabase = createServerSupabaseClient();

    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    if (planType === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Create or update subscription
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single() as any;

    if (existing) {
      await supabase
        .from('subscriptions')
        .update({
          plan_type: planType,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('subscriptions').insert({
        user_id: userId,
        stripe_subscription_id: orderId,
        plan_type: planType,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      });
    }

    // Record charity contribution
    const amountPaise = Math.round(order.order_amount * 100);
    const { data: profile } = await supabase
      .from('profiles')
      .select('selected_charity_id, charity_percentage')
      .eq('id', userId)
      .single() as any;

    if (profile?.selected_charity_id) {
      const charityAmount = Math.round((amountPaise * profile.charity_percentage) / 100);

      await supabase.from('charity_contributions').insert({
        user_id: userId,
        charity_id: profile.selected_charity_id,
        amount: charityAmount,
        source: 'subscription',
      });

      const { data: charity } = await supabase
        .from('charities')
        .select('total_received')
        .eq('id', profile.selected_charity_id)
        .single() as any;

      if (charity) {
        await supabase
          .from('charities')
          .update({ total_received: charity.total_received + charityAmount })
          .eq('id', profile.selected_charity_id);
      }
    }

    return NextResponse.redirect(
      `${appUrl}/dashboard?payment=success`
    );
  } catch (err) {
    console.error('Cashfree verify error:', err);
    return NextResponse.redirect(
      `${appUrl}/subscribe?error=verification_failed`
    );
  }
}
