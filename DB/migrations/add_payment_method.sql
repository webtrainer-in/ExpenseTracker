-- Add payment_method column to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NOT NULL DEFAULT 'UPI';

-- Add a check constraint to ensure only valid payment methods are stored
ALTER TABLE expenses
ADD CONSTRAINT check_payment_method 
CHECK (payment_method IN ('UPI', 'CASH', 'CARD'));
