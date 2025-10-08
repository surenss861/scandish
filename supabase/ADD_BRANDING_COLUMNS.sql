-- Add missing columns to branding_settings table
-- Run this script to add the additional branding fields used by the frontend

-- Add missing columns to branding_settings table
ALTER TABLE public.branding_settings 
ADD COLUMN IF NOT EXISTS menu_layout text DEFAULT 'classic',
ADD COLUMN IF NOT EXISTS corner_radius integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS content_spacing text DEFAULT 'comfortable',
ADD COLUMN IF NOT EXISTS background_pattern text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS animation_style text DEFAULT 'subtle',
ADD COLUMN IF NOT EXISTS button_style text DEFAULT 'rounded',
ADD COLUMN IF NOT EXISTS custom_css text DEFAULT '';

-- Update the font_family default to match frontend
ALTER TABLE public.branding_settings 
ALTER COLUMN font_family SET DEFAULT 'inter';

-- Add comment to table
COMMENT ON TABLE public.branding_settings IS 'User branding settings including logo, colors, fonts, and layout preferences';
