-- Migration: Add onboarding_step and owner_id to existing organizations
-- Purpose: Update existing organizations to have onboarding_step=1 and populate owner_id
-- Date: 2026-01-09

-- Step 1: Update ownerId from organization_members table
-- Get the owner (user with role 'owner') for each organization
UPDATE organizations org
SET owner_id = (
  SELECT om.user_id
  FROM organization_members om
  JOIN roles r ON r.id = om.role_id
  WHERE om.organization_id = org.id
    AND r.name = 'owner'
  LIMIT 1
)
WHERE org.owner_id IS NULL;

-- Step 2: Set onboarding_step = 1 for all existing organizations
-- (They've already completed basic info setup)
UPDATE organizations
SET onboarding_step = 1
WHERE onboarding_step = 0 OR onboarding_step IS NULL;

-- Step 3: Verify the update
DO $$
DECLARE
  total_orgs INTEGER;
  orgs_with_owner INTEGER;
  orgs_without_owner INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_orgs FROM organizations;
  SELECT COUNT(*) INTO orgs_with_owner FROM organizations WHERE owner_id IS NOT NULL;
  SELECT COUNT(*) INTO orgs_without_owner FROM organizations WHERE owner_id IS NULL;

  RAISE NOTICE 'Migration complete:';
  RAISE NOTICE '  Total organizations: %', total_orgs;
  RAISE NOTICE '  Organizations with owner: %', orgs_with_owner;
  RAISE NOTICE '  Organizations without owner: %', orgs_without_owner;

  IF orgs_without_owner > 0 THEN
    RAISE WARNING 'Some organizations do not have an owner assigned. This may cause issues.';
  END IF;
END $$;
