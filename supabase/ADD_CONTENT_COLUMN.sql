-- Add content column to menus table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menus' AND column_name = 'content'
    ) THEN
        ALTER TABLE public.menus ADD COLUMN content jsonb;
        RAISE NOTICE 'Added content column to menus table';
    ELSE
        RAISE NOTICE 'Content column already exists in menus table';
    END IF;
END $$;
