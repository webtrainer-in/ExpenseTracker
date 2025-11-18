-- Migration script to update user IDs from Replit Auth to Clerk
-- Run this in your Neon SQL Editor

-- First, let's see what user IDs exist in the database
SELECT id, email, "firstName", "lastName", role FROM users;

-- To migrate your expenses from old user ID to new Clerk user ID, run:
-- Replace 'OLD_USER_ID' with your old user ID from the query above
-- Replace 'user_35dgCEfAUyQsYyTEOQKfLMz642X' with your actual Clerk user ID

-- Step 1: Update the user record with Clerk user ID
UPDATE users 
SET id = 'user_35dgCEfAUyQsYyTEOQKfLMz642X'
WHERE email = 'webtrainer.in@gmail.com';

-- Step 2: Update all expenses to use the new user ID
UPDATE expenses 
SET "userId" = 'user_35dgCEfAUyQsYyTEOQKfLMz642X'
WHERE "userId" IN (
  SELECT id FROM users WHERE email = 'webtrainer.in@gmail.com'
);

-- Verify the migration
SELECT COUNT(*) as expense_count, "userId" 
FROM expenses 
WHERE "userId" = 'user_35dgCEfAUyQsYyTEOQKfLMz642X'
GROUP BY "userId";
