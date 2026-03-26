/**
 * Prisma-based seed script for the Supabase Postgres database.
 *
 * Requires:
 * - DATABASE_URL
 * - DIRECT_URL
 *
 * Run:
 *   node scripts/seed.mjs
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pg from 'pg'
import { readFileSync } from 'fs'

function loadEnvFile() {
  try {
    const raw = readFileSync('.env.local', 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (!match) continue

      const key = match[1].trim()
      let value = match[2].trim()

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      if (!(key in process.env)) {
        process.env[key] = value
      }
    }
  } catch {
    console.error('Could not read .env.local. Run this from the project root.')
    process.exit(1)
  }
}

loadEnvFile()

if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
  console.error('Missing DATABASE_URL or DIRECT_URL in .env.local')
  process.exit(1)
}

const { Pool } = pg

const ADMIN_EMAIL = 'admin@superhero.golf'
const ADMIN_PASSWORD = 'Admin@SuperHero123!'
const ADMIN_NAME = 'Super Admin'

const DEMO_PASSWORD = 'Demo@123456'

const charities = [
  {
    name: 'Golf for Good Foundation',
    slug: 'golf-for-good',
    description: 'Supporting youth golf programs and community development through the power of sport.',
    is_featured: true,
    website_url: 'https://example.org/golf-for-good',
    image_url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
    media_urls: [
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521424159246-9633578f5f3c?auto=format&fit=crop&w=1200&q=80',
    ],
    upcoming_events: [
      {
        date: '2026-05-12',
        title: 'Junior Golf Day',
        description: 'A fundraising golf day supporting access to youth coaching and equipment.',
        link_url: 'https://example.org/golf-for-good/junior-golf-day',
      },
    ],
  },
  {
    name: 'Fairway Hearts',
    slug: 'fairway-hearts',
    description: 'Providing golf therapy and rehabilitation programs for veterans and first responders.',
    is_featured: true,
    website_url: 'https://example.org/fairway-hearts',
    image_url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80',
    media_urls: [],
    upcoming_events: [],
  },
  {
    name: 'Green Future Trust',
    slug: 'green-future-trust',
    description: 'Environmental conservation focused on maintaining green spaces and golf course ecosystems.',
    is_featured: false,
    website_url: 'https://example.org/green-future-trust',
    image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    media_urls: [],
    upcoming_events: [],
  },
  {
    name: 'Swing for Schools',
    slug: 'swing-for-schools',
    description: 'Funding educational scholarships through community golf events and tournaments.',
    is_featured: true,
    website_url: 'https://example.org/swing-for-schools',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    media_urls: [],
    upcoming_events: [],
  },
  {
    name: 'The Caddie Fund',
    slug: 'the-caddie-fund',
    description: 'Supporting caddies and golf course workers with healthcare and emergency assistance.',
    is_featured: false,
    website_url: 'https://example.org/the-caddie-fund',
    image_url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
    media_urls: [],
    upcoming_events: [],
  },
  {
    name: 'Drive Change Initiative',
    slug: 'drive-change-initiative',
    description: 'A demo spotlight charity focused on inclusive golf access, mentorship, and community events.',
    is_featured: true,
    website_url: 'https://example.org/drive-change',
    image_url: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
    media_urls: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&q=80',
    ],
    upcoming_events: [
      {
        date: '2026-06-18',
        title: 'Community Charity Scramble',
        description: 'An open scramble event designed for donors, subscribers, and local youth mentors.',
        link_url: 'https://example.org/drive-change/scramble',
      },
      {
        date: '2026-07-04',
        title: 'Summer Skills Clinic',
        description: 'Free golf clinic for first-time players and scholarship applicants.',
        link_url: 'https://example.org/drive-change/skills-clinic',
      },
    ],
  },
]

const demoUsers = [
  {
    email: 'demo.player1@superhero.golf',
    password: DEMO_PASSWORD,
    fullName: 'Aarav Mehta',
    role: 'user',
    charitySlug: 'drive-change-initiative',
    charityPercentage: 20,
    subscription: { planType: 'yearly', status: 'active', daysRemaining: 220, cancelAtPeriodEnd: false },
    scores: [
      { score: 34, playedAt: '2026-03-25', position: 1 },
      { score: 31, playedAt: '2026-03-18', position: 2 },
      { score: 36, playedAt: '2026-03-10', position: 3 },
      { score: 29, playedAt: '2026-03-01', position: 4 },
      { score: 33, playedAt: '2026-02-22', position: 5 },
    ],
    contributionAmount: 19980,
  },
  {
    email: 'demo.player2@superhero.golf',
    password: DEMO_PASSWORD,
    fullName: 'Mia Fernandez',
    role: 'user',
    charitySlug: 'fairway-hearts',
    charityPercentage: 15,
    subscription: { planType: 'monthly', status: 'active', daysRemaining: 18, cancelAtPeriodEnd: true },
    scores: [
      { score: 27, playedAt: '2026-03-24', position: 1 },
      { score: 30, playedAt: '2026-03-15', position: 2 },
      { score: 25, playedAt: '2026-03-08', position: 3 },
      { score: 28, playedAt: '2026-02-28', position: 4 },
      { score: 32, playedAt: '2026-02-17', position: 5 },
    ],
    contributionAmount: 14985,
  },
  {
    email: 'demo.player3@superhero.golf',
    password: DEMO_PASSWORD,
    fullName: 'Luca Bennett',
    role: 'user',
    charitySlug: 'golf-for-good',
    charityPercentage: 30,
    subscription: { planType: 'monthly', status: 'canceled', daysRemaining: -4, cancelAtPeriodEnd: false },
    scores: [
      { score: 18, playedAt: '2026-02-10', position: 1 },
      { score: 20, playedAt: '2026-02-01', position: 2 },
      { score: 22, playedAt: '2026-01-21', position: 3 },
      { score: 19, playedAt: '2026-01-08', position: 4 },
      { score: 24, playedAt: '2025-12-28', position: 5 },
    ],
    contributionAmount: 9990,
  },
]

async function ensureAuthUser(prisma, { email, password, fullName }) {
  console.log(`  - checking auth user ${email}`)
  const existing = await prisma.$queryRawUnsafe(
    'SELECT id FROM auth.users WHERE email = $1 LIMIT 1',
    email
  )

  let userId = existing[0]?.id

  if (!userId) {
    console.log(`  - creating auth user ${email}`)
    const inserted = await prisma.$queryRawUnsafe(
      `
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at
        )
        VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          $1::text,
          crypt($2::text, gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('full_name', $3::text, 'email', $1::text, 'email_verified', true, 'phone_verified', false),
          now(),
          now()
        )
        RETURNING id
      `,
      email,
      password,
      fullName
    )

    userId = inserted[0]?.id
    console.log(`Created auth user (${email})`)
  }

  console.log(`  - ensuring identity for ${email}`)
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      )
      SELECT
        gen_random_uuid(),
        $1::uuid,
        jsonb_build_object(
          'sub', ($1::uuid)::text,
          'email', $2::text,
          'email_verified', true,
          'full_name', $3::text,
          'phone_verified', false
        ),
        'email',
        $2,
        now(),
        now(),
        now()
      WHERE NOT EXISTS (
        SELECT 1
        FROM auth.identities
        WHERE user_id = $1::uuid
          AND provider = 'email'
      )
    `,
    userId,
    email,
    fullName
  )

  return userId
}

async function ensureCharities(prisma) {
  const idsBySlug = {}

  for (const charity of charities) {
    const result = await prisma.$queryRawUnsafe(
      `
        INSERT INTO public.charities (
          name,
          slug,
          description,
          website_url,
          image_url,
          media_urls,
          upcoming_events,
          is_featured
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8)
        ON CONFLICT (slug)
        DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          website_url = EXCLUDED.website_url,
          image_url = EXCLUDED.image_url,
          media_urls = EXCLUDED.media_urls,
          upcoming_events = EXCLUDED.upcoming_events,
          is_featured = EXCLUDED.is_featured
        RETURNING id, slug
      `,
      charity.name,
      charity.slug,
      charity.description,
      charity.website_url,
      charity.image_url,
      JSON.stringify(charity.media_urls || []),
      JSON.stringify(charity.upcoming_events || []),
      charity.is_featured
    )

    idsBySlug[result[0].slug] = result[0].id
  }

  console.log(`Upserted ${charities.length} charities`)
  return idsBySlug
}

async function ensureProfile(prisma, { userId, email, fullName, role, selectedCharityId, charityPercentage }) {
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        selected_charity_id,
        charity_percentage
      )
      VALUES ($1::uuid, $2, $3, $4::user_role, $5::uuid, $6)
      ON CONFLICT (id)
      DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        selected_charity_id = EXCLUDED.selected_charity_id,
        charity_percentage = EXCLUDED.charity_percentage
    `,
    userId,
    email,
    fullName,
    role,
    selectedCharityId,
    charityPercentage
  )
}

async function ensureSubscription(prisma, userId, subscription) {
  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + subscription.daysRemaining)

  const paymentOrderId = `seed_${subscription.planType}_${String(userId).slice(0, 8)}`

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO public.subscriptions (
        user_id,
        payment_order_id,
        plan_type,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end
      )
      VALUES ($1::uuid, $2, $3, $4::subscription_status, $5::timestamptz, $6::timestamptz, $7)
      ON CONFLICT (payment_order_id)
      DO UPDATE SET
        plan_type = EXCLUDED.plan_type,
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        cancel_at_period_end = EXCLUDED.cancel_at_period_end
    `,
    userId,
    paymentOrderId,
    subscription.planType,
    subscription.status,
    start.toISOString(),
    end.toISOString(),
    subscription.cancelAtPeriodEnd
  )
}

async function ensureScores(prisma, userId, scores) {
  await prisma.$executeRawUnsafe('DELETE FROM public.scores WHERE user_id = $1::uuid', userId)

  for (const score of scores) {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO public.scores (user_id, score, played_at, position)
        VALUES ($1::uuid, $2, $3::date, $4)
      `,
      userId,
      score.score,
      score.playedAt,
      score.position
    )
  }
}

async function ensureContribution(prisma, { userId, charityId, amount }) {
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO public.charity_contributions (
        user_id,
        charity_id,
        amount,
        source,
        period_start,
        period_end
      )
      VALUES ($1::uuid, $2::uuid, $3, 'subscription'::contribution_source, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE)
    `,
    userId,
    charityId,
    amount
  )

  await prisma.$executeRawUnsafe(
    `
      UPDATE public.charities
      SET total_received = (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.charity_contributions
        WHERE charity_id = $1::uuid
      )
      WHERE id = $1::uuid
    `,
    charityId
  )
}

async function ensureDemoDraw(prisma, demoUserIds) {
  console.log('Ensuring demo draw')
  const drawResult = await prisma.$queryRawUnsafe(
    `
      INSERT INTO public.draws (
        draw_date,
        draw_month,
        status,
        draw_type,
        winning_numbers,
        total_pool_amount,
        five_match_pool,
        four_match_pool,
        three_match_pool,
        jackpot_rollover
      )
      VALUES (
        '2026-03-31T18:30:00.000Z'::timestamptz,
        '2026-03',
        'published'::draw_status,
        'algorithmic'::draw_type,
        ARRAY[27,28,30,32,34]::integer[],
        450000,
        180000,
        157500,
        112500,
        0
      )
      ON CONFLICT (draw_month)
      DO UPDATE SET
        status = EXCLUDED.status,
        draw_type = EXCLUDED.draw_type,
        winning_numbers = EXCLUDED.winning_numbers,
        total_pool_amount = EXCLUDED.total_pool_amount,
        five_match_pool = EXCLUDED.five_match_pool,
        four_match_pool = EXCLUDED.four_match_pool,
        three_match_pool = EXCLUDED.three_match_pool,
        jackpot_rollover = EXCLUDED.jackpot_rollover,
        published_at = NOW()
      RETURNING id
    `
  )

  const drawId = drawResult[0].id

  await prisma.$executeRawUnsafe('DELETE FROM public.draw_entries WHERE draw_id = $1::uuid', drawId)
  await prisma.$executeRawUnsafe('DELETE FROM public.winners WHERE draw_id = $1::uuid', drawId)

  const entries = [
    {
      userId: demoUserIds['demo.player1@superhero.golf'],
      scores: [29, 31, 33, 34, 36],
      matched: 2,
      prize: 0,
    },
    {
      userId: demoUserIds['demo.player2@superhero.golf'],
      scores: [27, 28, 30, 32, 25],
      matched: 4,
      prize: 157500,
    },
    {
      userId: demoUserIds['demo.player3@superhero.golf'],
      scores: [18, 20, 22, 19, 24],
      matched: 0,
      prize: 0,
    },
  ]

  for (const entry of entries) {
    const inserted = await prisma.$queryRawUnsafe(
      `
        INSERT INTO public.draw_entries (
          draw_id,
          user_id,
          scores_snapshot,
          matched_count,
          prize_amount
        )
        VALUES ($1::uuid, $2::uuid, $3::integer[], $4, $5)
        RETURNING id
      `,
      drawId,
      entry.userId,
      entry.scores,
      entry.matched,
      entry.prize
    )

    if (entry.prize > 0) {
      await prisma.$executeRawUnsafe(
        `
          INSERT INTO public.winners (
            draw_id,
            user_id,
            match_type,
            prize_amount,
            verification_status,
            proof_url,
            payment_status,
            paid_at
          )
          VALUES (
            $1::uuid,
            $2::uuid,
            '4-match'::match_type,
            $3,
            'approved'::verification_status,
            'https://example.org/proof/demo-player-2-proof.png',
            'pending'::payment_status,
            NULL
          )
        `,
        drawId,
        entry.userId,
        entry.prize
      )
    }
  }

  console.log('Seeded demo draw, draw entries, and winner record')
}

async function ensureAdmin(prisma, charityIds) {
  console.log('Ensuring admin account')
  const adminId = await ensureAuthUser(prisma, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    fullName: ADMIN_NAME,
  })

  await ensureProfile(prisma, {
    userId: adminId,
    email: ADMIN_EMAIL,
    fullName: ADMIN_NAME,
    role: 'admin',
    selectedCharityId: charityIds['drive-change-initiative'] || null,
    charityPercentage: 10,
  })

  return adminId
}

async function ensureDemoUsers(prisma, charityIds) {
  const userIds = {}

  for (const user of demoUsers) {
    console.log(`Ensuring demo user ${user.email}`)
    const userId = await ensureAuthUser(prisma, {
      email: user.email,
      password: user.password,
      fullName: user.fullName,
    })

    userIds[user.email] = userId

    await ensureProfile(prisma, {
      userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      selectedCharityId: charityIds[user.charitySlug] || null,
      charityPercentage: user.charityPercentage,
    })

    await ensureSubscription(prisma, userId, user.subscription)
    await ensureScores(prisma, userId, user.scores)

    if (charityIds[user.charitySlug]) {
      await ensureContribution(prisma, {
        userId,
        charityId: charityIds[user.charitySlug],
        amount: user.contributionAmount,
      })
    }
  }

  console.log(`Seeded ${demoUsers.length} demo users`)
  return userIds
}

async function main() {
  const adapter = new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  )
  const prisma = new PrismaClient({ adapter })

  try {
    const charityIds = await ensureCharities(prisma)
    await ensureAdmin(prisma, charityIds)
    const demoUserIds = await ensureDemoUsers(prisma, charityIds)
    await ensureDemoDraw(prisma, demoUserIds)

    console.log('')
    console.log('Seed complete.')
    console.log(`Admin email         : ${ADMIN_EMAIL}`)
    console.log(`Admin password      : ${ADMIN_PASSWORD}`)
    console.log(`Demo user password  : ${DEMO_PASSWORD}`)
    console.log('Demo users:')
    for (const user of demoUsers) {
      console.log(`  - ${user.email}`)
    }
  } catch (error) {
    console.error('Seed failed:', error.message)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
