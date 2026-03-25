import { NextResponse } from 'next/server';
import { getCashfree, PLAN_CONFIG } from '@/lib/cashfree';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType } = await request.json();

    if (!planType || !['monthly', 'yearly'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single() as any;

    const plan = PLAN_CONFIG[planType as keyof typeof PLAN_CONFIG];
    const orderId = `order_${user.id.slice(0, 8)}_${Date.now()}`;

    const cashfree = getCashfree();

    const orderRequest = {
      order_id: orderId,
      order_amount: plan.amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: user.id,
        customer_email: profile?.email || user.email,
        customer_phone: '9999999999',
        customer_name: profile?.full_name || 'Subscriber',
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cashfree/verify?order_id=${orderId}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cashfree/webhook`,
      },
      order_note: `GolfGives ${plan.name} subscription`,
      order_tags: {
        user_id: user.id,
        plan_type: planType,
      },
    };

    const response = await cashfree.PGCreateOrder(orderRequest);
    const orderData = response.data;

    return NextResponse.json({
      orderId: orderData.order_id,
      paymentSessionId: orderData.payment_session_id,
      orderAmount: plan.amount,
      planType,
    });
  } catch (err: unknown) {
    console.error('Cashfree order error:', err);
    const message = err instanceof Error ? err.message : 'Failed to create order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
