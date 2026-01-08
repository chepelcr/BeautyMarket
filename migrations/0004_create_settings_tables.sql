-- Migration: Create normalized settings tables
-- Purpose: Replace JSONB organization.settings with normalized tables
-- Date: 2026-01-05

-- Create theme_settings table
CREATE TABLE theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  primary_color VARCHAR(7) DEFAULT '#ec4899',
  secondary_color VARCHAR(7) DEFAULT '#f472b6',
  logo_url TEXT,
  favicon_url TEXT,
  font_family VARCHAR(100) DEFAULT 'Inter',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create contact_settings table
CREATE TABLE contact_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  whatsapp_number VARCHAR(50),
  business_hours TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create payment_settings table
CREATE TABLE payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  currency VARCHAR(3) DEFAULT 'CRC',
  stripe_enabled BOOLEAN DEFAULT false,
  stripe_publishable_key TEXT,
  stripe_secret_key TEXT,
  cash_on_delivery_enabled BOOLEAN DEFAULT true,
  bank_transfer_enabled BOOLEAN DEFAULT false,
  bank_account_details TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create shipping_settings table
CREATE TABLE shipping_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  free_shipping_threshold INTEGER, -- in cents
  default_shipping_cost INTEGER, -- in cents
  enable_local_pickup BOOLEAN DEFAULT true,
  enable_correos_shipping BOOLEAN DEFAULT true,
  enable_uber_flash BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (allow authenticated users full access)
CREATE POLICY "theme_settings_authenticated_access" ON theme_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "contact_settings_authenticated_access" ON contact_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "payment_settings_authenticated_access" ON payment_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "shipping_settings_authenticated_access" ON shipping_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_theme_settings_org ON theme_settings(organization_id);
CREATE INDEX idx_contact_settings_org ON contact_settings(organization_id);
CREATE INDEX idx_payment_settings_org ON payment_settings(organization_id);
CREATE INDEX idx_shipping_settings_org ON shipping_settings(organization_id);

-- Add comments for documentation
COMMENT ON TABLE theme_settings IS 'Stores theme customization for each organization (colors, logo, favicon)';
COMMENT ON TABLE contact_settings IS 'Stores contact information for each organization (email, phone, social media)';
COMMENT ON TABLE payment_settings IS 'Stores payment configuration for each organization (currency, payment methods)';
COMMENT ON TABLE shipping_settings IS 'Stores shipping configuration for each organization (costs, methods)';
