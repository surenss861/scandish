-- ============================================================================
-- ADD MISSING BRANDING COLUMNS TO BRANDING_SETTINGS TABLE
-- ============================================================================
-- This script adds the missing columns that the frontend branding system expects
-- Run this in your Supabase SQL Editor to update the branding_settings table
-- ============================================================================

-- Add missing columns to branding_settings table
ALTER TABLE public.branding_settings 
ADD COLUMN IF NOT EXISTS menu_layout text DEFAULT 'classic',
ADD COLUMN IF NOT EXISTS corner_radius integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS content_spacing text DEFAULT 'comfortable',
ADD COLUMN IF NOT EXISTS background_pattern text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS animation_style text DEFAULT 'subtle',
ADD COLUMN IF NOT EXISTS button_style text DEFAULT 'rounded',
ADD COLUMN IF NOT EXISTS custom_css text DEFAULT '';

-- Fix font family default to match frontend expectations
ALTER TABLE public.branding_settings 
ALTER COLUMN font_family SET DEFAULT 'inter';

-- Add constraints for validation (drop existing first to avoid conflicts)
DO $$
BEGIN
    -- Drop constraints if they exist
    BEGIN
        ALTER TABLE public.branding_settings DROP CONSTRAINT IF EXISTS check_corner_radius;
        ALTER TABLE public.branding_settings DROP CONSTRAINT IF EXISTS check_menu_layout;
        ALTER TABLE public.branding_settings DROP CONSTRAINT IF EXISTS check_content_spacing;
        ALTER TABLE public.branding_settings DROP CONSTRAINT IF EXISTS check_background_pattern;
        ALTER TABLE public.branding_settings DROP CONSTRAINT IF EXISTS check_animation_style;
        ALTER TABLE public.branding_settings DROP CONSTRAINT IF EXISTS check_button_style;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;
    
    -- Add constraints
    ALTER TABLE public.branding_settings 
    ADD CONSTRAINT check_corner_radius 
        CHECK (corner_radius >= 0 AND corner_radius <= 50);

    ALTER TABLE public.branding_settings 
    ADD CONSTRAINT check_menu_layout 
        CHECK (menu_layout IN ('classic', 'card', 'minimal', 'magazine', 'grid'));

    ALTER TABLE public.branding_settings 
    ADD CONSTRAINT check_content_spacing 
        CHECK (content_spacing IN ('compact', 'comfortable', 'spacious', 'luxury'));

    ALTER TABLE public.branding_settings 
    ADD CONSTRAINT check_background_pattern 
        CHECK (background_pattern IN ('none', 'gradient', 'subtle-dots', 'grid', 'diagonal', 'noise', 'organic'));

    ALTER TABLE public.branding_settings 
    ADD CONSTRAINT check_animation_style 
        CHECK (animation_style IN ('none', 'subtle', 'smooth', 'bouncy', 'elegant'));

    ALTER TABLE public.branding_settings 
    ADD CONSTRAINT check_button_style 
        CHECK (button_style IN ('rounded', 'pill', 'sharp', 'outline'));
END $$;

-- Update existing records with default values
UPDATE public.branding_settings 
SET 
    font_family = CASE 
        WHEN font_family = 'Inter' THEN 'inter'
        ELSE COALESCE(font_family, 'inter')
    END,
    menu_layout = COALESCE(menu_layout, 'classic'),
    corner_radius = COALESCE(corner_radius, 12),
    content_spacing = COALESCE(content_spacing, 'comfortable'),
    background_pattern = COALESCE(background_pattern, 'none'),
    animation_style = COALESCE(animation_style, 'subtle'),
    button_style = COALESCE(button_style, 'rounded'),
    custom_css = COALESCE(custom_css, '');

-- Verify the changes
SELECT 
    'Branding columns added successfully! 🎨' as status,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'branding_settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
