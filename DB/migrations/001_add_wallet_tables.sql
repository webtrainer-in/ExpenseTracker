-- Migration: Add wallet balance feature
-- Created: 2026-01-21
-- Description: Adds wallet_balances and wallet_transactions tables for tracking user cash balances

-- Create wallet_balances table
CREATE TABLE IF NOT EXISTS wallet_balances (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_wallet_balances_user_id ON wallet_balances(user_id);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  related_expense_id VARCHAR REFERENCES expenses(id) ON DELETE SET NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for wallet_transactions
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_date ON wallet_transactions(date);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);

-- Initialize wallet balance for existing users with 0 balance
INSERT INTO wallet_balances (user_id, current_balance)
SELECT id, 0 FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Add comment to tables
COMMENT ON TABLE wallet_balances IS 'Stores current wallet balance for each user';
COMMENT ON TABLE wallet_transactions IS 'Tracks all wallet deposits and withdrawals';
