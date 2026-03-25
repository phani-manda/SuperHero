import { Cashfree, CFEnvironment } from 'cashfree-pg';

let _client: any = null;

export function getCashfree(): any {
  if (!_client) {
    const env = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production'
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX;
    _client = new Cashfree(env, process.env.CASHFREE_APP_ID!, process.env.CASHFREE_SECRET_KEY!);
  }
  return _client;
}

export const PLAN_CONFIG = {
  monthly: {
    amount: Number(process.env.MONTHLY_PLAN_AMOUNT || 99900) / 100, // ₹999
    name: 'Monthly Plan',
  },
  yearly: {
    amount: Number(process.env.YEARLY_PLAN_AMOUNT || 899900) / 100, // ₹8,999
    name: 'Yearly Plan',
  },
};
