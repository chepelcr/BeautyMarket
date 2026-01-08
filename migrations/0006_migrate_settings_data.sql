-- Migration: Migrate settings data from JSONB to normalized tables
-- Purpose: Extract organization.settings JSONB data and populate theme_settings, contact_settings, payment_settings, and shipping_settings
-- Date: 2026-01-05

-- Migrate theme settings
INSERT INTO theme_settings (organization_id, primary_color, secondary_color, logo_url, favicon_url, font_family)
SELECT
  id,
  COALESCE(settings->'theme'->>'primaryColor', '#ec4899')::VARCHAR(7),
  COALESCE(settings->'theme'->>'secondaryColor', '#f472b6')::VARCHAR(7),
  (settings->'theme'->>'logoUrl')::TEXT,
  (settings->'theme'->>'faviconUrl')::TEXT,
  'Inter'
FROM organizations
WHERE settings IS NOT NULL
ON CONFLICT (organization_id) DO NOTHING;

-- Migrate contact settings
INSERT INTO contact_settings (
  organization_id,
  email,
  phone,
  address,
  facebook_url,
  instagram_url,
  twitter_url,
  whatsapp_number
)
SELECT
  id,
  (settings->'contact'->>'email')::VARCHAR(255),
  (settings->'contact'->>'phone')::VARCHAR(50),
  (settings->'contact'->>'address')::TEXT,
  (settings->'contact'->'socialMedia'->>'facebook')::TEXT,
  (settings->'contact'->'socialMedia'->>'instagram')::TEXT,
  (settings->'contact'->'socialMedia'->>'twitter')::TEXT,
  (settings->'contact'->'socialMedia'->>'whatsapp')::VARCHAR(50)
FROM organizations
WHERE settings IS NOT NULL
ON CONFLICT (organization_id) DO NOTHING;

-- Migrate payment settings
INSERT INTO payment_settings (
  organization_id,
  currency,
  stripe_enabled,
  cash_on_delivery_enabled
)
SELECT
  id,
  COALESCE((settings->'payment'->>'currency')::VARCHAR(3), 'CRC'),
  COALESCE((settings->'payment'->>'stripeEnabled')::BOOLEAN, false),
  COALESCE((settings->'payment'->>'cashOnDeliveryEnabled')::BOOLEAN, true)
FROM organizations
WHERE settings IS NOT NULL
ON CONFLICT (organization_id) DO NOTHING;

-- Migrate shipping settings
INSERT INTO shipping_settings (
  organization_id,
  free_shipping_threshold,
  default_shipping_cost
)
SELECT
  id,
  (settings->'shipping'->>'freeShippingThreshold')::INTEGER,
  (settings->'shipping'->>'defaultShippingCost')::INTEGER
FROM organizations
WHERE settings IS NOT NULL
ON CONFLICT (organization_id) DO NOTHING;

-- Create default settings for organizations that don't have settings JSONB
-- This ensures all organizations have at least default settings

-- Default theme settings
INSERT INTO theme_settings (organization_id, primary_color, secondary_color, font_family)
SELECT
  id,
  '#ec4899',
  '#f472b6',
  'Inter'
FROM organizations
WHERE settings IS NULL
ON CONFLICT (organization_id) DO NOTHING;

-- Default contact settings (empty)
INSERT INTO contact_settings (organization_id)
SELECT id
FROM organizations
WHERE settings IS NULL
ON CONFLICT (organization_id) DO NOTHING;

-- Default payment settings
INSERT INTO payment_settings (organization_id, currency, stripe_enabled, cash_on_delivery_enabled)
SELECT
  id,
  'CRC',
  false,
  true
FROM organizations
WHERE settings IS NULL
ON CONFLICT (organization_id) DO NOTHING;

-- Default shipping settings
INSERT INTO shipping_settings (organization_id, enable_local_pickup, enable_correos_shipping, enable_uber_flash)
SELECT
  id,
  true,
  true,
  true
FROM organizations
WHERE settings IS NULL
ON CONFLICT (organization_id) DO NOTHING;

-- Add comment documenting this migration
COMMENT ON TABLE theme_settings IS 'Stores theme customization for each organization (colors, logo, favicon) - Migrated from organizations.settings JSONB';
COMMENT ON TABLE contact_settings IS 'Stores contact information for each organization (email, phone, social media) - Migrated from organizations.settings JSONB';
COMMENT ON TABLE payment_settings IS 'Stores payment configuration for each organization (currency, payment methods) - Migrated from organizations.settings JSONB';
COMMENT ON TABLE shipping_settings IS 'Stores shipping configuration for each organization (costs, methods) - Migrated from organizations.settings JSONB';
