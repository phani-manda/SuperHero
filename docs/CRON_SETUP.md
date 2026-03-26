# Subscription Management & Cron Jobs Setup

## Overview

The golf charity platform uses Cashfree for one-time payment processing. To handle subscription renewals and expirations, we've implemented a cron job system.

## How Subscriptions Work

1. **Initial Payment**: User subscribes via Cashfree payment (monthly or yearly)
2. **Active Period**: Subscription is marked `active` with `current_period_end` date
3. **Expiration Check**: Cron job checks daily for expired subscriptions
4. **Renewal**: Users must manually renew (no auto-charge) or we can implement auto-renewal
5. **Cancellation**: Users can cancel, which sets `cancel_at_period_end` to true

## API Endpoints

### 1. Check Expired Subscriptions

**Endpoint**: `POST /api/subscriptions/check-expired`

**Purpose**: Marks expired subscriptions as `canceled`

**Authentication**: Requires `Authorization: Bearer <CRON_SECRET>` header

**Response**:
```json
{
  "message": "Expired subscriptions updated",
  "updated": 5,
  "subscriptions": [
    {
      "userId": "user-id",
      "expiredOn": "2024-03-25T00:00:00Z",
      "planType": "monthly"
    }
  ]
}
```

### 2. Cancel Subscription

**Endpoint**: `POST /api/subscriptions/cancel`

**Purpose**: User-initiated cancellation (stays active until period ends)

**Authentication**: Requires user session

**Response**:
```json
{
  "message": "Subscription will be canceled at period end",
  "subscription": {
    "id": "sub-id",
    "planType": "monthly",
    "currentPeriodEnd": "2024-04-25T00:00:00Z",
    "cancelAtPeriodEnd": true
  }
}
```

## Setting Up Cron Jobs

### Option 1: Vercel Cron (Recommended for Vercel deployments)

1. **Create `vercel.json` in project root:**

```json
{
  "crons": [
    {
      "path": "/api/subscriptions/check-expired",
      "schedule": "0 0 * * *"
    }
  ]
}
```

2. **Add CRON_SECRET to Vercel Environment Variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `CRON_SECRET` = `<your-secure-random-string>`
   - Generate secure secret: `openssl rand -base64 32`

3. **Update the cron endpoint to accept Vercel auth:**

Vercel automatically adds special headers. Update `check-expired/route.ts` to accept Vercel's auth:

```typescript
const authHeader = request.headers.get('authorization');
const cronSecret = process.env.CRON_SECRET;
const vercelCronSecret = request.headers.get('x-vercel-cron-signature');

// Accept either Vercel's signature or custom CRON_SECRET
if (!vercelCronSecret && authHeader !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Option 2: GitHub Actions

1. **Create `.github/workflows/check-subscriptions.yml`:**

```yaml
name: Check Expired Subscriptions

on:
  schedule:
    # Runs daily at 00:00 UTC
    - cron: '0 0 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  check-subscriptions:
    runs-on: ubuntu-latest
    steps:
      - name: Call subscription check endpoint
        run: |
          curl -X POST https://your-domain.com/api/subscriptions/check-expired \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

2. **Add secret to GitHub:**
   - Repository → Settings → Secrets and variables → Actions
   - Add: `CRON_SECRET` = `<your-secure-random-string>`

### Option 3: External Cron Service (EasyCron, cron-job.org)

1. **Sign up for a cron service** (e.g., https://cron-job.org)
2. **Create new cron job:**
   - URL: `https://your-domain.com/api/subscriptions/check-expired`
   - Method: POST
   - Schedule: Daily at midnight
   - Headers: `Authorization: Bearer <your-cron-secret>`

### Option 4: Supabase Edge Functions (Advanced)

Use Supabase's pg_cron extension:

```sql
-- Run daily at midnight
SELECT cron.schedule(
  'check-expired-subscriptions',
  '0 0 * * *',
  $$
  UPDATE subscriptions
  SET status = 'canceled'
  WHERE status = 'active'
    AND current_period_end < NOW();
  $$
);
```

## Environment Variables

Add to `.env.local` and production environment:

```bash
# Generate with: openssl rand -base64 32
CRON_SECRET=your_secure_random_string_here
```

## Testing

### Test locally:
```bash
# Start dev server
npm run dev

# Call the endpoint (GET allowed in development)
curl http://localhost:3000/api/subscriptions/check-expired
```

### Test in production:
```bash
curl -X POST https://your-domain.com/api/subscriptions/check-expired \
  -H "Authorization: Bearer your-cron-secret"
```

## Implementation Checklist

- [ ] Add `CRON_SECRET` to `.env.local`
- [ ] Add `CRON_SECRET` to production environment variables
- [ ] Choose cron option (Vercel Cron, GitHub Actions, or external)
- [ ] Set up cron job with daily schedule
- [ ] Test endpoint works with correct auth
- [ ] Monitor logs for successful execution
- [ ] Test subscription cancellation flow
- [ ] Set up alerting for cron failures (optional)

## Future Enhancements

### Auto-Renewal (Phase 2)

To implement automatic renewal:

1. Store user payment method with Cashfree Token Vault
2. Before subscription expires, create new payment order
3. Charge saved payment method automatically
4. Handle webhook for success/failure
5. Update subscription period or mark as past_due

### Renewal Notifications

Add email notifications:

1. 7 days before expiry: "Your subscription will expire soon"
2. 3 days before expiry: "Renew now to keep access"
3. On expiry: "Your subscription has expired"

## Monitoring

Track these metrics:
- Number of subscriptions checked daily
- Number marked as expired
- Failed cron executions
- Average subscription length

## Troubleshooting

**Cron not running:**
- Check CRON_SECRET is set correctly
- Verify endpoint is accessible (not behind auth middleware)
- Check cron service logs

**Subscriptions not expiring:**
- Manually call endpoint to test
- Check `current_period_end` values in database
- Verify timezone handling (use UTC)

**Past_due vs Canceled:**
- `past_due`: Payment failed (from Cashfree webhook)
- `canceled`: Expired or user-initiated cancellation
