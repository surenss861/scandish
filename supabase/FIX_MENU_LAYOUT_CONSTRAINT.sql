-- ============================================================================
-- FIX MENU LAYOUT CONSTRAINT TO MATCH FRONTEND VALUES
-- ============================================================================
-- This script updates the menu_layout constraint to allow the correct values
-- that the frontend menu customization system uses
-- ============================================================================

-- Drop the existing constraint
ALTER TABLE public.branding_settings DROP CONSTRAINT IF EXISTS check_menu_layout;

-- Add the corrected constraint with proper menu layout values
ALTER TABLE public.branding_settings 
ADD CONSTRAINT check_menu_layout 
    CHECK (menu_layout IN ('single-column', 'two-column', 'grid', 'card-based'));

-- Update any existing records that might have old values
UPDATE public.branding_settings 
SET menu_layout = CASE 
    WHEN menu_layout = 'classic' THEN 'single-column'
    WHEN menu_layout = 'card' THEN 'card-based'
    WHEN menu_layout = 'minimal' THEN 'single-column'
    WHEN menu_layout = 'magazine' THEN 'grid'
    ELSE 'single-column'
END
WHERE menu_layout NOT IN ('single-column', 'two-column', 'grid', 'card-based');

-- Verify the constraint was updated
SELECT 
    'Menu layout constraint updated successfully! 🎯' as status,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'branding_settings'::regclass 
  AND conname = 'check_menu_layout';


