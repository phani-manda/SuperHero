// Database types — will be auto-generated from Supabase CLI in production.
// Using permissive types for development build compatibility.
// Run `npx supabase gen types typescript` to generate exact types from your project.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Database {
  [key: string]: any;
}

// Application-level types used across components
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  cashfree_customer_id: string | null;
  selected_charity_id: string | null;
  charity_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  payment_order_id: string;
  plan_type: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  played_at: string;
  position: number;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  website_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  total_received: number;
  created_at: string;
  updated_at: string;
}

export interface Draw {
  id: string;
  draw_date: string;
  draw_month: string;
  status: 'pending' | 'simulated' | 'published';
  draw_type: 'random' | 'algorithmic';
  winning_numbers: number[];
  total_pool_amount: number;
  five_match_pool: number;
  four_match_pool: number;
  three_match_pool: number;
  jackpot_rollover: number;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  scores_snapshot: number[];
  matched_count: number;
  prize_amount: number;
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: '5-match' | '4-match' | '3-match';
  prize_amount: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  proof_url: string | null;
  payment_status: 'pending' | 'paid';
  paid_at: string | null;
  created_at: string;
}

export interface CharityContribution {
  id: string;
  user_id: string;
  charity_id: string;
  amount: number;
  source: 'subscription' | 'donation';
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}
