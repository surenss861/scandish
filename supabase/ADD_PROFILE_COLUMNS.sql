-- ============================================================================
-- ADD MISSING PROFILE COLUMNS TO USERS TABLE
-- ============================================================================
-- Add address, website, and description columns to the users table
-- for the profile settings functionality
-- ============================================================================

-- Add missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS description text;

-- Update the updated_at timestamp when any of these fields change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON COLUMN public.users.address IS 'Restaurant physical address';
COMMENT ON COLUMN public.users.website IS 'Restaurant website URL';
COMMENT ON COLUMN public.users.description IS 'Restaurant description/bio';
 