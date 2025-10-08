-- Add menu-specific branding columns to branding_settings table
-- This enables comprehensive menu customization options

-- Add menu customization columns
ALTER TABLE public.branding_settings 
ADD COLUMN IF NOT EXISTS menu_style text DEFAULT 'minimal',
ADD COLUMN IF NOT EXISTS item_display text DEFAULT 'full-details',
ADD COLUMN IF NOT EXISTS price_style text DEFAULT 'inline',
ADD COLUMN IF NOT EXISTS category_style text DEFAULT 'headers',
ADD COLUMN IF NOT EXISTS show_item_images boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_allergens boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_calories boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS compact_mode boolean DEFAULT false;

-- Add constraints for valid values
ALTER TABLE public.branding_settings 
ADD CONSTRAINT check_menu_style 
CHECK (menu_style IN ('minimal', 'elegant', 'modern', 'classic', 'luxury'));

ALTER TABLE public.branding_settings 
ADD CONSTRAINT check_item_display 
CHECK (item_display IN ('name-only', 'name-description', 'name-price', 'full-details'));

ALTER TABLE public.branding_settings 
ADD CONSTRAINT check_price_style 
CHECK (price_style IN ('inline', 'separate', 'highlighted', 'minimal'));

ALTER TABLE public.branding_settings 
ADD CONSTRAINT check_category_style 
CHECK (category_style IN ('headers', 'dividers', 'cards', 'tabs'));

-- Add comments for documentation
COMMENT ON COLUMN public.branding_settings.menu_style IS 'Overall visual style of the menu (minimal, elegant, modern, classic, luxury)';
COMMENT ON COLUMN public.branding_settings.item_display IS 'How menu items are displayed (name-only, name-description, name-price, full-details)';
COMMENT ON COLUMN public.branding_settings.price_style IS 'How prices are displayed (inline, separate, highlighted, minimal)';
COMMENT ON COLUMN public.branding_settings.category_style IS 'How categories are displayed (headers, dividers, cards, tabs)';
COMMENT ON COLUMN public.branding_settings.show_item_images IS 'Whether to display item images';
COMMENT ON COLUMN public.branding_settings.show_allergens IS 'Whether to display allergen information';
COMMENT ON COLUMN public.branding_settings.show_calories IS 'Whether to display calorie information';
COMMENT ON COLUMN public.branding_settings.compact_mode IS 'Whether to use compact spacing for more content';

-- Update existing records with default values
UPDATE public.branding_settings 
SET 
    menu_style = 'minimal',
    item_display = 'full-details',
    price_style = 'inline',
    category_style = 'headers',
    show_item_images = true,
    show_allergens = false,
    show_calories = false,
    compact_mode = false
WHERE menu_style IS NULL 
   OR item_display IS NULL 
   OR price_style IS NULL 
   OR category_style IS NULL;
