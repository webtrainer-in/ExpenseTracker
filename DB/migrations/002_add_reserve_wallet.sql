-- Migration: Add Reserve Wallet feature
-- Created: 2026-01-23
-- Description: Adds reserve_wallet and reserve_transactions tables for shared family reserve

-- Create reserve_wallet table (singleton table)
CREATE TABLE IF NOT EXISTS reserve_wallet (
  id VARCHAR PRIMARY KEY DEFAULT 'reserve',
  current_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Initialize with one row
INSERT INTO reserve_wallet (id, current_balance) 
VALUES ('reserve', 0) 
ON CONFLICT (id) DO NOTHING;

-- Create reserve_transactions table
CREATE TABLE IF NOT EXISTS reserve_transactions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  performed_by_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  related_wallet_transaction_id VARCHAR REFERENCES wallet_transactions(id) ON DELETE SET NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for reserve_transactions
CREATE INDEX IF NOT EXISTS idx_reserve_transactions_date ON reserve_transactions(date);
CREATE INDEX IF NOT EXISTS idx_reserve_transactions_type ON reserve_transactions(type);
CREATE INDEX IF NOT EXISTS idx_reserve_transactions_user ON reserve_transactions(performed_by_user_id);

-- Add comments to tables
COMMENT ON TABLE reserve_wallet IS 'Stores the shared family reserve wallet balance (singleton)';
COMMENT ON TABLE reserve_transactions IS 'Tracks all deposits and withdrawals from the reserve wallet';
