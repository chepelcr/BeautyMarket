-- Migration: Add verification_token to organizations table
-- Purpose: Add verification_token field for DNS-based custom domain verification
-- Date: 2025-01-12
-- Related Requirements: 8.1, 8.3, 8.5

-- Add verification_token column (stores cryptographically secure token for domain verification)
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(64);

-- Create index for performance when looking up organizations by verification token
CREATE INDEX IF NOT EXISTS idx_organizations_verification_token 
ON organizations(verification_token) 
WHERE verification_token IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN organizations.verification_token IS 'Cryptographically secure random token used for DNS-based custom domain ownership verification. Generated when custom domain is added or updated.';
