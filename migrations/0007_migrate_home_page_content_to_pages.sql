-- Migration: Migrate home_page_content to new page system
-- Purpose: Convert legacy home_page_content table data to pages, page_sections, and section_content
-- Date: 2026-01-05

-- Step 1: Create default 'home' pages for all organizations that don't have one
INSERT INTO pages (organization_id, type, slug, title, meta_description, is_active, sort_order)
SELECT
  id,
  'home',
  'home',
  'Home',
  'Welcome to our store',
  true,
  0
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM pages WHERE pages.organization_id = organizations.id AND pages.type = 'home'
);

-- Step 2: Create page sections for each unique section in home_page_content
-- This groups content by organization and section, creating sections for each home page
INSERT INTO page_sections (page_id, section_type, name, sort_order, is_active)
SELECT DISTINCT
  p.id AS page_id,
  hpc.section AS section_type,
  CASE
    WHEN hpc.section = 'hero' THEN 'Hero Section'
    WHEN hpc.section = 'categories' THEN 'Categories Section'
    WHEN hpc.section = 'about' THEN 'About Section'
    WHEN hpc.section = 'contact' THEN 'Contact Section'
    ELSE INITCAP(hpc.section) || ' Section'
  END AS name,
  CASE
    WHEN hpc.section = 'hero' THEN 0
    WHEN hpc.section = 'categories' THEN 1
    WHEN hpc.section = 'about' THEN 2
    WHEN hpc.section = 'contact' THEN 3
    ELSE 99
  END AS sort_order,
  true AS is_active
FROM home_page_content hpc
INNER JOIN pages p ON p.organization_id = hpc.organization_id AND p.type = 'home'
WHERE NOT EXISTS (
  SELECT 1 FROM page_sections ps
  WHERE ps.page_id = p.id AND ps.section_type = hpc.section
)
GROUP BY p.id, hpc.section;

-- Step 3: Migrate content rows from home_page_content to section_content
-- This preserves all the editable content fields
INSERT INTO section_content (
  section_id,
  key,
  value,
  value_type,
  display_name,
  description,
  sort_order
)
SELECT
  ps.id AS section_id,
  hpc.key,
  hpc.value,
  hpc.type AS value_type,
  hpc.display_name,
  hpc.description,
  hpc.sort_order
FROM home_page_content hpc
INNER JOIN pages p ON p.organization_id = hpc.organization_id AND p.type = 'home'
INNER JOIN page_sections ps ON ps.page_id = p.id AND ps.section_type = hpc.section
ON CONFLICT (section_id, key) DO UPDATE SET
  value = EXCLUDED.value,
  value_type = EXCLUDED.value_type,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Step 4: Create indexes for the newly populated data (if not already created)
-- These are likely already created in 0005_create_template_system_tables.sql but we ensure they exist
CREATE INDEX IF NOT EXISTS idx_pages_org_type ON pages(organization_id, type);
CREATE INDEX IF NOT EXISTS idx_page_sections_page_type ON page_sections(page_id, section_type);

-- Add comments documenting the migration
COMMENT ON TABLE pages IS 'Pages per organization (home, products, about, contact, etc.) - Migrated from home_page_content';
COMMENT ON TABLE page_sections IS 'Sections within pages (hero, gallery, products-grid, etc.) - Migrated from home_page_content sections';
COMMENT ON TABLE section_content IS 'Content for page sections - Migrated from home_page_content rows';

-- Note: Do NOT drop home_page_content table yet
-- Keep it for rollback purposes and drop it in a future migration after verification
COMMENT ON TABLE home_page_content IS 'DEPRECATED: Legacy home page content storage. Data has been migrated to pages/page_sections/section_content. Will be dropped in future migration.';
