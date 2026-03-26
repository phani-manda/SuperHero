# Golf Charity Subscription Platform

A full-stack Next.js platform that combines golf score tracking, monthly reward draws, subscription billing, and charity giving.

This project was built around the Digital Heroes sample PRD for a golf charity subscription product. It includes:

- public marketing pages
- user authentication and dashboard
- subscription purchase and management
- golf score entry with rolling 5-score retention
- monthly draw simulation and publishing
- charity selection and donations
- winner proof upload, review, and payout tracking
- admin dashboard for users, subscriptions, draws, charities, winners, and reports

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Supabase Auth, Database, and Storage
- Prisma 7 for direct Postgres tooling
- Cashfree payment gateway
- Resend for transactional email notifications

## Product Areas

### Public

- homepage
- how-it-works page
- charity directory
- individual charity pages
- subscription page

### Subscriber

- signup/login
- subscription status
- score entry and editing
- charity selection and contribution percentage
- draw participation summary
- winnings summary
- winner proof upload

### Admin

- user management
- profile editing
- role updates
- score editing
- subscription management
- draw simulation and publishing
- charity CRUD
- charity content/media/events management
- winner verification and payout status updates
- reports and analytics

## Repository Structure

```text
src/
  app/
    admin/                  Admin pages
    api/                    Route handlers
    auth/                   Login/signup/callback pages
    charities/              Public charity pages
    dashboard/              Subscriber dashboard
    subscribe/              Subscription page
  components/
    admin/                  Admin UI components
    auth/                   Auth UI
    charities/              Charity UI
    dashboard/              Dashboard UI
    home/                   Homepage sections
    scores/                 Score entry UI
  lib/
    draw/                   Draw engine
    supabase/               Supabase clients and middleware
    notifications.ts        Email notification helpers
supabase/
  migrations/               SQL schema and follow-up migrations
prisma/
  schema.prisma             Prisma config schema
scripts/
  seed.mjs                  Direct Postgres seed script
docs/
  BUGFIX_SUMMARY.md
  CRON_SETUP.md
```

## Environment Variables

Copy [`.env.local.example`](C:/my%20all%20projects/SuperHero/.env.local.example) to `.env.local` and fill in the values.

Core variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

DATABASE_URL=
DIRECT_URL=

CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
NEXT_PUBLIC_CASHFREE_ENV=sandbox

MONTHLY_PLAN_AMOUNT=99900
YEARLY_PLAN_AMOUNT=899900

NEXT_PUBLIC_APP_URL=http://localhost:3000

RESEND_API_KEY=
RESEND_FROM_EMAIL=

CRON_SECRET=
```

Notes:

- `DATABASE_URL` should use the Supabase pooler connection string.
- `DIRECT_URL` should use the direct or migration-friendly connection string.
- Email notifications are optional at runtime, but subscription and winner emails only send when `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` from `.env.local.example`.

### 3. Apply database schema

Bootstrap the main schema:

```bash
npm run db:push-schema
```

Apply the PRD follow-up migration:

```bash
npx prisma db execute --file supabase/migrations/002_prd_feature_gap_updates.sql
```

### 4. Seed data

```bash
npm run db:seed
```

This seed script:

- creates or updates the admin auth user
- promotes the linked profile to `admin`
- seeds sample charities

### 5. Start development

```bash
npm run dev
```

### 6. Production build

```bash
npm run build
npm run start
```

## Database and Seeding

This repo supports direct Postgres operations through Prisma and `pg`.

Useful commands:

```bash
npm run db:generate
npm run db:push-schema
npm run db:seed
```

Important files:

- [`prisma/schema.prisma`](C:/my%20all%20projects/SuperHero/prisma/schema.prisma)
- [`prisma.config.ts`](C:/my%20all%20projects/SuperHero/prisma.config.ts)
- [`scripts/seed.mjs`](C:/my%20all%20projects/SuperHero/scripts/seed.mjs)
- [`supabase/migrations/001_prisma_bootstrap.sql`](C:/my%20all%20projects/SuperHero/supabase/migrations/001_prisma_bootstrap.sql)
- [`supabase/migrations/002_prd_feature_gap_updates.sql`](C:/my%20all%20projects/SuperHero/supabase/migrations/002_prd_feature_gap_updates.sql)

## Authentication and Roles

The app currently uses a two-role model:

- `user`
- `admin`

Role enforcement happens in multiple layers:

- middleware-level redirect protection
- admin layout checks
- admin API route authorization

Primary files:

- [`src/lib/supabase/middleware.ts`](C:/my%20all%20projects/SuperHero/src/lib/supabase/middleware.ts)
- [`src/app/admin/layout.tsx`](C:/my%20all%20projects/SuperHero/src/app/admin/layout.tsx)
- [`src/app/api/admin/users/route.ts`](C:/my%20all%20projects/SuperHero/src/app/api/admin/users/route.ts)
- [`src/app/api/admin/subscriptions/route.ts`](C:/my%20all%20projects/SuperHero/src/app/api/admin/subscriptions/route.ts)

Signup now includes:

- full name
- selected charity
- charity contribution percentage

Those values are persisted into the user profile via:

- signup metadata
- the `handle_new_user()` DB trigger
- auth callback backfill after email confirmation

## Subscription Flow

### End-user flow

1. User chooses a monthly or yearly plan.
2. Backend creates a Cashfree order.
3. Payment verification or webhook marks the subscription active.
4. Subscription status is shown on the dashboard.
5. User can cancel at period end.

Main files:

- [`src/app/subscribe/page.tsx`](C:/my%20all%20projects/SuperHero/src/app/subscribe/page.tsx)
- [`src/app/api/cashfree/order/route.ts`](C:/my%20all%20projects/SuperHero/src/app/api/cashfree/order/route.ts)
- [`src/app/api/cashfree/verify/route.ts`](C:/my%20all%20projects/SuperHero/src/app/api/cashfree/verify/route.ts)
- [`src/app/api/cashfree/webhook/route.ts`](C:/my%20all%20projects/SuperHero/src/app/api/cashfree/webhook/route.ts)
- [`src/app/api/subscriptions/cancel/route.ts`](C:/my%20all%20projects/SuperHero/src/app/api/subscriptions/cancel/route.ts)

### Admin flow

Admins can review and edit subscription records from:

- [`src/app/admin/subscriptions/page.tsx`](C:/my%20all%20projects/SuperHero/src/app/admin/subscriptions/page.tsx)

## Score System

The score system follows the PRD requirement of retaining only the latest 5 Stableford scores.

Implemented behavior:

- score range validation: `1-45`
- date required
- rolling 5-score retention handled at DB level
- user add/edit/delete
- admin score editing

Primary files:

- [`src/components/scores/score-entry.tsx`](C:/my%20all%20projects/SuperHero/src/components/scores/score-entry.tsx)
- [`src/app/api/scores/route.ts`](C:/my%20all%20projects/SuperHero/src/app/api/scores/route.ts)
- [`src/app/api/admin/scores/route.ts`](C:/my%20all%20projects/SuperHero/src/app/api/admin/scores/route.ts)

## Draw Engine

The draw system supports:

- random draw logic
- algorithmic draw logic based on score frequencies
- monthly simulation
- admin publish flow
- 5-match / 4-match / 3-match tiers
- jackpot rollover

Primary files:

- [`src/lib/draw/engine.ts`](C:/my%20all%20projects/SuperHero/src/lib/draw/engine.ts)
- [`src/app/api/draws/simulate/route.ts`](C:/my%20all%20projects/SuperHero/src/app/api/draws/simulate/route.ts)
- [`src/app/api/draws/publish/route.ts`](C:/my%20all%20projects/SuperHero/src/app/api/draws/publish/route.ts)
- [`src/app/admin/draws/page.tsx`](C:/my%20all%20projects/SuperHero/src/app/admin/draws/page.tsx)

## Charity System

Implemented features:

- public charity directory
- featured charities on homepage
- search and featured filtering
- individual charity pages
- independent donations
- user charity selection and contribution percentage
- admin charity create/edit/delete
- cover image, media gallery, and upcoming events support

Primary files:

- [`src/app/charities/page.tsx`](C:/my%20all%20projects/SuperHero/src/app/charities/page.tsx)
- [`src/app/charities/[slug]/page.tsx`](C:/my%20all%20projects/SuperHero/src/app/charities/[slug]/page.tsx)
- [`src/components/charities/charity-list.tsx`](C:/my%20all%20projects/SuperHero/src/components/charities/charity-list.tsx)
- [`src/components/admin/admin-charity-form.tsx`](C:/my%20all%20projects/SuperHero/src/components/admin/admin-charity-form.tsx)
- [`src/components/admin/admin-charity-actions.tsx`](C:/my%20all%20projects/SuperHero/src/components/admin/admin-charity-actions.tsx)
- [`src/lib/supabase/storage.ts`](C:/my%20all%20projects/SuperHero/src/lib/supabase/storage.ts)

## Winners and Verification

Implemented features:

- winner record creation on draw publish
- proof upload from dashboard
- admin approve/reject
- payout marking
- winner notification hooks

Primary files:

- [`src/components/dashboard/winner-proof-upload.tsx`](C:/my%20all%20projects/SuperHero/src/components/dashboard/winner-proof-upload.tsx)
- [`src/app/api/winners/upload-proof/route.ts`](C:/my%20all%20projects/SuperHero/src/app/api/winners/upload-proof/route.ts)
- [`src/app/api/winners/verify/route.ts`](C:/my%20all%20projects/SuperHero/src/app/api/winners/verify/route.ts)
- [`src/app/admin/winners/page.tsx`](C:/my%20all%20projects/SuperHero/src/app/admin/winners/page.tsx)

## Email Notifications

Notification hooks are implemented for:

- subscription activated
- subscription cancellation scheduled
- draw winner alert
- proof approved
- proof rejected
- payout completed

Primary file:

- [`src/lib/notifications.ts`](C:/my%20all%20projects/SuperHero/src/lib/notifications.ts)

If Resend is not configured, the app skips email sending safely.

## Admin Access

The seed workflow promotes the seeded user to `admin`, but you can also elevate a user manually by updating `profiles.role = 'admin'`.

Admin areas:

- `/admin`
- `/admin/users`
- `/admin/subscriptions`
- `/admin/draws`
- `/admin/charities`
- `/admin/winners`
- `/admin/reports`

## Known Notes

- `npm run build` currently passes.
- `npm run lint` may prompt for initial Next.js ESLint setup if ESLint config is not yet initialized in the environment.
- The project uses Cashfree rather than Stripe, which still satisfies the PRD’s “or equivalent PCI-compliant provider” direction.
- Some operational tasks, like expired subscription cleanup, may be run on a schedule. See [`CRON_SETUP.md`](C:/my%20all%20projects/SuperHero/docs/CRON_SETUP.md).

## Supporting Docs

- [`BUGFIX_SUMMARY.md`](C:/my%20all%20projects/SuperHero/docs/BUGFIX_SUMMARY.md)
- [`CRON_SETUP.md`](C:/my%20all%20projects/SuperHero/docs/CRON_SETUP.md)

## Development Notes

If you are continuing work on the platform, a good default workflow is:

```bash
npm install
npm run db:generate
npm run db:push-schema
npx prisma db execute --file supabase/migrations/002_prd_feature_gap_updates.sql
npm run db:seed
npm run dev
```

For release validation:

```bash
npm run build
```
