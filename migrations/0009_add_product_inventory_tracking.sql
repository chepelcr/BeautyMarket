-- Migration: Add Product Inventory Tracking
-- Description: Adds stock quantity, SKU, low stock threshold, and inventory tracking fields to products table
-- Created: 2026-01-07

-- Add inventory tracking columns to products table
DO $$
BEGIN
  -- Add sku column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sku'
  ) THEN
    ALTER TABLE products ADD COLUMN sku VARCHAR(100) UNIQUE;
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
  END IF;

  -- Add stock_quantity column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT 0 NOT NULL;
  END IF;

  -- Add low_stock_threshold column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 10 NOT NULL;
  END IF;

  -- Add track_inventory column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'track_inventory'
  ) THEN
    ALTER TABLE products ADD COLUMN track_inventory BOOLEAN DEFAULT true NOT NULL;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - unique identifier for inventory tracking';
COMMENT ON COLUMN products.stock_quantity IS 'Current stock quantity available';
COMMENT ON COLUMN products.low_stock_threshold IS 'Threshold for low stock alerts';
COMMENT ON COLUMN products.track_inventory IS 'Whether to track inventory for this product';

-- Create index for efficient stock queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity) WHERE track_inventory = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_low_stock ON products(organization_id, stock_quantity)
  WHERE track_inventory = true AND stock_quantity <= low_stock_threshold;
