-- Add icon fields to template_theme_settings table
ALTER TABLE template_theme_settings 
ADD COLUMN IF NOT EXISTS loading_icon TEXT,
ADD COLUMN IF NOT EXISTS product_fallback_icon TEXT;

-- Set default values for existing records
UPDATE template_theme_settings 
SET loading_icon = 'Sparkles', 
    product_fallback_icon = 'Sparkles'
WHERE loading_icon IS NULL OR product_fallback_icon IS NULL;
