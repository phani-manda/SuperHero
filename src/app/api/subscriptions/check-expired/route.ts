import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/subscriptions/check-expired
 *
 * Checks for expired subscriptions and marks them as inactive.
 * Should be called by a cron job (e.g., daily via Vercel Cron, GitHub Actions, etc.)
 *
 * Authentication: Requires cron_secret in headers for security
 */
export async function POST(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  // Find all subscriptions that have expired but are still marked as active
  const { data: expiredSubs, error: fetchError } = await supabase
    .from('subscriptions')
    .select('id, user_id, current_period_end, plan_type')
    .eq('status', 'active')
    .lt('current_period_end', now);

  if (fetchError) {
    console.error('Error fetching expired subscriptions:', fetchError);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  if (!expiredSubs || expiredSubs.length === 0) {
    return NextResponse.json({
      message: 'No expired subscriptions found',
      updated: 0,
    });
  }

  // Update expired subscriptions to 'canceled' status
  const expiredIds = expiredSubs.map(s => s.id);
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .in('id', expiredIds);

  if (updateError) {
    console.error('Error updating expired subscriptions:', updateError);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  console.log(`Marked ${expiredSubs.length} subscriptions as canceled`);

  return NextResponse.json({
    message: 'Expired subscriptions updated',
    updated: expiredSubs.length,
    subscriptions: expiredSubs.map(s => ({
      userId: s.user_id,
      expiredOn: s.current_period_end,
      planType: s.plan_type,
    })),
  });
}

/**
 * GET /api/subscriptions/check-expired
 *
 * Same functionality but accessible via GET for easier testing
 * In production, use POST with cron secret
 */
export async function GET(request: Request) {
  // For development/testing, allow GET without auth
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Use POST in production' }, { status: 405 });
  }

  return POST(request);
}
