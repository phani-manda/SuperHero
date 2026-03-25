import { Cashfree, CFEnvironment } from 'cashfree-pg';
import {
  getCashfreeAppId,
  getCashfreeMode,
  getCashfreeSecretKey,
  getMonthlyPlanAmountPaise,
  getYearlyPlanAmountPaise,
} from '@/lib/env';

let _client: any = null;

export function getCashfree(): any {
  if (!_client) {
    const env = getCashfreeMode() === 'production'
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX;
    _client = new Cashfree(env, getCashfreeAppId(), getCashfreeSecretKey());
  }
  return _client;
}

export const PLAN_CONFIG = {
  monthly: {
    amount: getMonthlyPlanAmountPaise() / 100, // ₹999
    name: 'Monthly Plan',
  },
  yearly: {
    amount: getYearlyPlanAmountPaise() / 100, // ₹8,999
    name: 'Yearly Plan',
  },
};
