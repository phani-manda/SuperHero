/**
 * Supabase Seed Script
 * -------------------
 * Creates the admin user and seeds charities into the remote Supabase project.
 * Run from the project root:  node scripts/seed.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ── Read .env.local manually ─────────────────────────────────────────────────
const env = {}
try {
  const raw = readFileSync('.env.local', 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/)
    if (match) env[match[1].trim()] = match[2].trim()
  }
} catch {
  console.error('❌  Could not read .env.local. Make sure you run this from the project root.')
  process.exit(1)
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

console.log(`\n🚀  Connecting to: ${SUPABASE_URL}\n`)

// ── Admin Supabase client (uses service role — bypasses RLS) ─────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── 1. Create admin auth user ─────────────────────────────────────────────────
console.log('👤  Creating admin user…')
const { data: createData, error: createError } = await supabase.auth.admin.createUser({
  email: 'admin@superhero.golf',
  password: 'Admin@SuperHero123!',
  email_confirm: true,
  user_metadata: { full_name: 'Super Admin' },
})

let adminUserId = createData?.user?.id

if (createError) {
  if (createError.message?.toLowerCase().includes('already registered') ||
      createError.message?.toLowerCase().includes('already been registered') ||
      createError.status === 422) {
    console.log('ℹ️   Admin user already exists — skipping creation.')
    // Look up the existing user
    const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const existing = listData?.users?.find(u => u.email === 'admin@superhero.golf')
    adminUserId = existing?.id
  } else {
    console.error('❌  Failed to create admin user:', createError.message)
  }
} else {
  console.log(`✅  Admin user created  (id: ${adminUserId})`)
}

// ── 2. Elevate profile role to admin ─────────────────────────────────────────
if (adminUserId) {
  console.log('🔑  Elevating profile role to admin…')
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin', full_name: 'Super Admin' })
    .eq('id', adminUserId)

  if (profileError) {
    console.error('❌  Profile update failed:', profileError.message)
    console.log('    (The profiles table might not exist yet — apply the schema migration first.)')
  } else {
    console.log('✅  Profile elevated to admin')
  }
}

// ── 3. Seed charities ─────────────────────────────────────────────────────────
console.log('\n🏌️  Seeding charities…')
const charities = [
  {
    name: 'Golf for Good Foundation',
    slug: 'golf-for-good',
    description: 'Supporting youth golf programs and community development through the power of sport.',
    is_featured: true,
  },
  {
    name: 'Fairway Hearts',
    slug: 'fairway-hearts',
    description: 'Providing golf therapy and rehabilitation programs for veterans and first responders.',
    is_featured: true,
  },
  {
    name: 'Green Future Trust',
    slug: 'green-future-trust',
    description: 'Environmental conservation focused on maintaining green spaces and golf course ecosystems.',
    is_featured: false,
  },
  {
    name: 'Swing for Schools',
    slug: 'swing-for-schools',
    description: 'Funding educational scholarships through community golf events and tournaments.',
    is_featured: true,
  },
  {
    name: 'The Caddie Fund',
    slug: 'the-caddie-fund',
    description: 'Supporting caddies and golf course workers with healthcare and emergency assistance.',
    is_featured: false,
  },
]

const { error: charityError } = await supabase
  .from('charities')
  .upsert(charities, { onConflict: 'slug', ignoreDuplicates: false })

if (charityError) {
  console.error('❌  Charities seed failed:', charityError.message)
  console.log('    (The charities table might not exist yet — apply the schema migration first.)')
} else {
  console.log('✅  5 charities upserted')
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Seeding complete!

Admin credentials:
  Email   : admin@superhero.golf
  Password: Admin@SuperHero123!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
