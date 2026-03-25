import { NextResponse } from 'next/server';
import { getCashfree, PLAN_CONFIG } from '@/lib/cashfree';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    const cashfree = getCashfree();

    // Verify webhook signature
    const signature = request.headers.get('x-webhook-signature') || '';
    const timestamp = request.headers.get('x-webhook-timestamp') || '';

    try {
      cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const eventType = body.type;

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK') {
      const data = body.data;
      const orderId = data.order?.order_id;
      const userId = data.order?.order_tags?.user_id;
      const planType = (data.order?.order_tags?.plan_type || 'monthly') as keyof typeof PLAN_CONFIG;

      if (!userId || !orderId) {
        return NextResponse.json({ received: true });
      }

      const now = new Date();
      const periodEnd = new Date(now);
      if (planType === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('stripe_subscription_id', orderId)
        .single() as any;

      if (existing) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
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
      const amountPaise = Math.round((data.order?.order_amount || 0) * 100);
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_charity_id, charity_percentage')
        .eq('id', userId)
        .single() as any;

      if (profile?.selected_charity_id && amountPaise > 0) {
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
    }

    if (eventType === 'PAYMENT_FAILED_WEBHOOK') {
      const orderId = body.data?.order?.order_id;
      if (orderId) {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', orderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Cashfree webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
