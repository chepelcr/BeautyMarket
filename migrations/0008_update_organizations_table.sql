-- Migration: Update organizations table for template system
-- Purpose: Add template system fields to organizations table (is_template, template_id, cloned_from_organization_id)
-- Date: 2026-01-05

-- Add is_template column (indicates if this organization is a template)
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false NOT NULL;

-- Add template_id column (references which template was used to create this organization)
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES templates(id);

-- Add cloned_from_organization_id column (references the organization this was cloned from)
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS cloned_from_organization_id UUID REFERENCES organizations(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_is_template ON organizations(is_template) WHERE is_template = true;
CREATE INDEX IF NOT EXISTS idx_organizations_template_id ON organizations(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_cloned_from ON organizations(cloned_from_organization_id) WHERE cloned_from_organization_id IS NOT NULL;

-- Add foreign key constraint with ON DELETE SET NULL for template_id
-- If a template is deleted, organizations using it will have template_id set to NULL
-- Note: This constraint may already exist from entity definition, so we use IF NOT EXISTS-like pattern
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'organizations_template_id_fkey'
  ) THEN
    ALTER TABLE organizations
    ADD CONSTRAINT organizations_template_id_fkey
    FOREIGN KEY (template_id)
    REFERENCES templates(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key constraint with ON DELETE SET NULL for cloned_from_organization_id
-- If source organization is deleted, cloned organizations will have cloned_from_organization_id set to NULL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'organizations_cloned_from_organization_id_fkey'
  ) THEN
    ALTER TABLE organizations
    ADD CONSTRAINT organizations_cloned_from_organization_id_fkey
    FOREIGN KEY (cloned_from_organization_id)
    REFERENCES organizations(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN organizations.is_template IS 'Indicates if this organization is a template (used to create new organizations)';
COMMENT ON COLUMN organizations.template_id IS 'References the template used to create this organization';
COMMENT ON COLUMN organizations.cloned_from_organization_id IS 'References the organization this was cloned from (for tracking lineage)';

-- Add table comment update
COMMENT ON TABLE organizations IS 'Multi-tenant organizations table with template system support. Supports both regular organizations and template organizations.';

-- Note: The organizations.settings JSONB field will be deprecated in a future migration
-- after all code has been updated to use the new normalized settings tables
COMMENT ON COLUMN organizations.settings IS 'DEPRECATED: Legacy JSONB settings storage. Data has been migrated to theme_settings, contact_settings, payment_settings, and shipping_settings. Will be dropped in future migration.';
