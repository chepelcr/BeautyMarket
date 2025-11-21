-- Migration: Add gender field to users table
-- Description: Adds optional gender field to support gender-neutral user profiles

ALTER TABLE users ADD COLUMN gender VARCHAR(20);

-- Create index for gender field for potential filtering
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);

-- Add comment for clarity
COMMENT ON COLUMN users.gender IS 'User gender preference: male, female, other, or prefer_not_to_say';
