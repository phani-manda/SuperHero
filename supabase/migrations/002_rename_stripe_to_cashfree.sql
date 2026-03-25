-- Rename stripe-specific columns for Cashfree compatibility
-- The column stores the Cashfree order_id now
ALTER TABLE subscriptions RENAME COLUMN stripe_subscription_id TO payment_order_id;
ALTER TABLE profiles RENAME COLUMN stripe_customer_id TO cashfree_customer_id;
