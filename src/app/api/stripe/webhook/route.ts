import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription' && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        await handleSubscriptionChange(supabase, subscription);
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(supabase, subscription);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
        // Record charity contribution on renewal
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
        const userId = subscription.metadata.user_id;
        if (userId) {
          await recordCharityContribution(supabase, userId, invoice.amount_paid);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionChange(
  supabase: ReturnType<typeof createServiceRoleClient>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata.user_id;
  if (!userId) return;

  const planType = subscription.metadata.plan_type || 'monthly';
  const status = mapStripeStatus(subscription.status);

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (existing) {
    await supabase
      .from('subscriptions')
      .update({
        status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('stripe_subscription_id', subscription.id);
  } else {
    await supabase.from('subscriptions').insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      plan_type: planType as 'monthly' | 'yearly',
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    });
  }
}

async function recordCharityContribution(
  supabase: ReturnType<typeof createServiceRoleClient>,
  userId: string,
  amountPaid: number
) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('selected_charity_id, charity_percentage')
    .eq('id', userId)
    .single();

  if (profile?.selected_charity_id) {
    const charityAmount = Math.round((amountPaid * profile.charity_percentage) / 100);

    await supabase.from('charity_contributions').insert({
      user_id: userId,
      charity_id: profile.selected_charity_id,
      amount: charityAmount,
      source: 'subscription',
    });

    // Update charity total
    const { data: charity } = await supabase
      .from('charities')
      .select('total_received')
      .eq('id', profile.selected_charity_id)
      .single();

    if (charity) {
      await supabase
        .from('charities')
        .update({ total_received: charity.total_received + charityAmount })
        .eq('id', profile.selected_charity_id);
    }
  }
}

function mapStripeStatus(status: Stripe.Subscription.Status): 'active' | 'canceled' | 'past_due' | 'incomplete' {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'canceled':
    case 'unpaid':
      return 'canceled';
    case 'past_due':
      return 'past_due';
    default:
      return 'incomplete';
  }
}
