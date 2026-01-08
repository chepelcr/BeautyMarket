-- Migration: Create template and page system tables
-- Purpose: Enable multi-template system with flexible page builder
-- Date: 2026-01-05

-- Create templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create pages table
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('home', 'products', 'categories', 'about', 'contact', 'cart', 'checkout')),
  slug VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  meta_description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(organization_id, slug)
);

-- Create page_sections table
CREATE TABLE page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_type VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create components table (system component library)
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  default_config JSONB,
  is_system BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create section_content table (replaces home_page_content)
CREATE TABLE section_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
  component_id UUID REFERENCES components(id),
  key VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  value_type VARCHAR(50) DEFAULT 'text' NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(section_id, key)
);

-- Enable Row Level Security (RLS)
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_content ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "templates_public_read" ON templates
  FOR SELECT USING (true);

CREATE POLICY "pages_authenticated_access" ON pages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "page_sections_authenticated_access" ON page_sections
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "components_public_read" ON components
  FOR SELECT USING (true);

CREATE POLICY "section_content_authenticated_access" ON section_content
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_active ON templates(is_active) WHERE is_active = true;
CREATE INDEX idx_pages_org ON pages(organization_id);
CREATE INDEX idx_pages_type ON pages(type);
CREATE INDEX idx_pages_template ON pages(template_id);
CREATE INDEX idx_page_sections_page ON page_sections(page_id);
CREATE INDEX idx_page_sections_type ON page_sections(section_type);
CREATE INDEX idx_section_content_section ON section_content(section_id);
CREATE INDEX idx_section_content_component ON section_content(component_id);

-- Add comments for documentation
COMMENT ON TABLE templates IS 'Template definitions for multi-tenant system (beauty-market, tech-gadgets, etc.)';
COMMENT ON TABLE pages IS 'Pages per organization (home, products, about, contact, etc.)';
COMMENT ON TABLE page_sections IS 'Sections within pages (hero, gallery, products-grid, etc.)';
COMMENT ON TABLE components IS 'Reusable component definitions (hero, product-card, gallery, etc.)';
COMMENT ON TABLE section_content IS 'Content for page sections (replaces home_page_content with more flexibility)';
