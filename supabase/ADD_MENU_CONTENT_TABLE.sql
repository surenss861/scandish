-- Create menu_content table for storing custom menu content in branding editor
-- This is separate from the main menus table and used specifically for branding previews

CREATE TABLE IF NOT EXISTS public.menu_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'My Restaurant',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one menu content per user
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_menu_content_user_id ON public.menu_content(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to menu_content table
DROP TRIGGER IF EXISTS update_menu_content_updated_at ON public.menu_content;
CREATE TRIGGER update_menu_content_updated_at
    BEFORE UPDATE ON public.menu_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.menu_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own menu content
CREATE POLICY "Users can view their own menu content" ON public.menu_content
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own menu content" ON public.menu_content
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menu content" ON public.menu_content
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menu content" ON public.menu_content
    FOR DELETE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE public.menu_content IS 'Stores custom menu content for branding editor previews';
COMMENT ON COLUMN public.menu_content.user_id IS 'Reference to the user who owns this menu content';
COMMENT ON COLUMN public.menu_content.title IS 'Restaurant name displayed in the menu';
COMMENT ON COLUMN public.menu_content.items IS 'JSON array of menu items with name, description, price, category, emoji';
COMMENT ON COLUMN public.menu_content.created_at IS 'When this menu content was first created';
COMMENT ON COLUMN public.menu_content.updated_at IS 'When this menu content was last modified';

