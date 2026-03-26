import { readFileSync } from 'fs'
import { defineConfig, env } from 'prisma/config'

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
  // Prisma commands can still rely on process env if .env.local is absent.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
})
