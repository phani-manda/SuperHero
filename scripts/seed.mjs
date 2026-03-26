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

const charities = [
  ['Golf for Good Foundation', 'golf-for-good', 'Supporting youth golf programs and community development through the power of sport.', true],
  ['Fairway Hearts', 'fairway-hearts', 'Providing golf therapy and rehabilitation programs for veterans and first responders.', true],
  ['Green Future Trust', 'green-future-trust', 'Environmental conservation focused on maintaining green spaces and golf course ecosystems.', false],
  ['Swing for Schools', 'swing-for-schools', 'Funding educational scholarships through community golf events and tournaments.', true],
  ['The Caddie Fund', 'the-caddie-fund', 'Supporting caddies and golf course workers with healthcare and emergency assistance.', false],
]

async function ensureAdmin(prisma) {
  const existing = await prisma.$queryRawUnsafe(
    'SELECT id FROM auth.users WHERE email = $1 LIMIT 1',
    ADMIN_EMAIL
  )

  let adminId = existing[0]?.id

  if (!adminId) {
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
          $1,
          crypt($2, gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('full_name', $3::text),
          now(),
          now()
        )
        RETURNING id
      `,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
      ADMIN_NAME
    )

    adminId = inserted[0]?.id
    console.log(`Created admin auth user (${adminId})`)
  } else {
    console.log(`Admin auth user already exists (${adminId})`)
  }

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
        jsonb_build_object('sub', $1::text, 'email', $2::text),
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
    adminId,
    ADMIN_EMAIL
  )

  await prisma.$executeRawUnsafe(
    `
      UPDATE public.profiles
      SET role = 'admin', full_name = $2, email = $3
      WHERE id = $1::uuid
    `,
    adminId,
    ADMIN_NAME,
    ADMIN_EMAIL
  )
}

async function ensureCharities(prisma) {
  for (const [name, slug, description, isFeatured] of charities) {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO public.charities (name, slug, description, is_featured)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug)
        DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          is_featured = EXCLUDED.is_featured
      `,
      name,
      slug,
      description,
      isFeatured
    )
  }

  console.log(`Upserted ${charities.length} charities`)
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
    await ensureAdmin(prisma)
    await ensureCharities(prisma)

    console.log('')
    console.log('Seed complete.')
    console.log(`Admin email   : ${ADMIN_EMAIL}`)
    console.log(`Admin password: ${ADMIN_PASSWORD}`)
  } catch (error) {
    console.error('Seed failed:', error.message)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
