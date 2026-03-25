type CashfreeMode = 'production' | 'sandbox';

function requireEnv(value: string | undefined, name: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parsePositiveAmount(raw: string | undefined, name: string, fallback: number): number {
  if (!raw || raw.trim().length === 0) {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid environment variable: ${name}. Expected a positive number.`);
  }

  return value;
}

export function getSupabaseUrl() {
  return requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
}

export function getSupabaseAnonKey() {
  return requireEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export function getSupabaseServiceRoleKey() {
  return requireEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY');
}

export function getCashfreeAppId() {
  return requireEnv(process.env.CASHFREE_APP_ID, 'CASHFREE_APP_ID');
}

export function getCashfreeSecretKey() {
  return requireEnv(process.env.CASHFREE_SECRET_KEY, 'CASHFREE_SECRET_KEY');
}

export function getAppUrl() {
  return requireEnv(process.env.NEXT_PUBLIC_APP_URL, 'NEXT_PUBLIC_APP_URL');
}

export function getCashfreeMode(): CashfreeMode {
  return process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
}

export function getMonthlyPlanAmountPaise() {
  return parsePositiveAmount(process.env.MONTHLY_PLAN_AMOUNT, 'MONTHLY_PLAN_AMOUNT', 99900);
}

export function getYearlyPlanAmountPaise() {
  return parsePositiveAmount(process.env.YEARLY_PLAN_AMOUNT, 'YEARLY_PLAN_AMOUNT', 899900);
}

