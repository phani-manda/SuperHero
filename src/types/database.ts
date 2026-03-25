export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin';
          stripe_customer_id: string | null;
          selected_charity_id: string | null;
          charity_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          stripe_customer_id?: string | null;
          selected_charity_id?: string | null;
          charity_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          stripe_customer_id?: string | null;
          selected_charity_id?: string | null;
          charity_percentage?: number;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          plan_type: 'monthly' | 'yearly';
          status: 'active' | 'canceled' | 'past_due' | 'incomplete';
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id: string;
          plan_type: 'monthly' | 'yearly';
          status?: 'active' | 'canceled' | 'past_due' | 'incomplete';
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'active' | 'canceled' | 'past_due' | 'incomplete';
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
      };
      scores: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          played_at: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score: number;
          played_at: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          score?: number;
          played_at?: string;
          position?: number;
        };
      };
      charities: {
        Row: {
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
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          image_url?: string | null;
          website_url?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          total_received?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string;
          image_url?: string | null;
          website_url?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          total_received?: number;
          updated_at?: string;
        };
      };
      draws: {
        Row: {
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
        };
        Insert: {
          id?: string;
          draw_date?: string;
          draw_month: string;
          status?: 'pending' | 'simulated' | 'published';
          draw_type?: 'random' | 'algorithmic';
          winning_numbers?: number[];
          total_pool_amount?: number;
          five_match_pool?: number;
          four_match_pool?: number;
          three_match_pool?: number;
          jackpot_rollover?: number;
          created_by?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: 'pending' | 'simulated' | 'published';
          draw_type?: 'random' | 'algorithmic';
          winning_numbers?: number[];
          total_pool_amount?: number;
          five_match_pool?: number;
          four_match_pool?: number;
          three_match_pool?: number;
          jackpot_rollover?: number;
          published_at?: string | null;
        };
      };
      draw_entries: {
        Row: {
          id: string;
          draw_id: string;
          user_id: string;
          scores_snapshot: number[];
          matched_count: number;
          prize_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          draw_id: string;
          user_id: string;
          scores_snapshot: number[];
          matched_count?: number;
          prize_amount?: number;
          created_at?: string;
        };
        Update: {
          matched_count?: number;
          prize_amount?: number;
        };
      };
      winners: {
        Row: {
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
        };
        Insert: {
          id?: string;
          draw_id: string;
          user_id: string;
          match_type: '5-match' | '4-match' | '3-match';
          prize_amount: number;
          verification_status?: 'pending' | 'approved' | 'rejected';
          proof_url?: string | null;
          payment_status?: 'pending' | 'paid';
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          verification_status?: 'pending' | 'approved' | 'rejected';
          proof_url?: string | null;
          payment_status?: 'pending' | 'paid';
          paid_at?: string | null;
        };
      };
      charity_contributions: {
        Row: {
          id: string;
          user_id: string;
          charity_id: string;
          amount: number;
          source: 'subscription' | 'donation';
          period_start: string | null;
          period_end: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          charity_id: string;
          amount: number;
          source?: 'subscription' | 'donation';
          period_start?: string | null;
          period_end?: string | null;
          created_at?: string;
        };
        Update: {
          amount?: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: 'user' | 'admin';
      subscription_status: 'active' | 'canceled' | 'past_due' | 'incomplete';
      draw_status: 'pending' | 'simulated' | 'published';
      draw_type: 'random' | 'algorithmic';
      match_type: '5-match' | '4-match' | '3-match';
      verification_status: 'pending' | 'approved' | 'rejected';
      payment_status: 'pending' | 'paid';
      contribution_source: 'subscription' | 'donation';
    };
  };
}
