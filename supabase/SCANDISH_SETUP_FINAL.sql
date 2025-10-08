-- SCANDISH SUPABASE SETUP - FINAL VERSION
-- This version handles existing policies gracefully

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage bucket for menu photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-photos', 
  'menu-photos', 
  true, 
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  restaurant_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create menus table
CREATE TABLE IF NOT EXISTS public.menus (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  content jsonb,
  is_active boolean DEFAULT true,
  organization_id uuid,
  location_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id uuid NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  category text,
  emoji text,
  image_url text,
  image_path text,
  is_available boolean DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add content column to menus table if it doesn't exist (for existing databases)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menus' AND column_name = 'content'
    ) THEN
        ALTER TABLE public.menus ADD COLUMN content jsonb;
    END IF;
END $$;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  organization_id uuid,
  seat_count integer DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscriptions_user_id_key' 
        AND table_name = 'subscriptions'
    ) THEN
        ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type text NOT NULL,
  menu_slug text NOT NULL,
  menu_id uuid REFERENCES public.menus(id) ON DELETE CASCADE,
  item_name text,
  item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  referrer text,
  is_bot boolean DEFAULT false,
  is_mobile boolean DEFAULT false,
  ip_hash text,
  session_id text,
  country_code text,
  device_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create branding_settings table
CREATE TABLE IF NOT EXISTS public.branding_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  logo_url text,
  logo_path text,
  primary_color text DEFAULT '#F3C77E',
  secondary_color text DEFAULT '#702632',
  accent_color text DEFAULT '#d6a856',
  font_family text DEFAULT 'Inter',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'branding_settings_user_id_key' 
        AND table_name = 'branding_settings'
    ) THEN
        ALTER TABLE public.branding_settings ADD CONSTRAINT branding_settings_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  website text,
  phone text,
  address text,
  city text,
  state text,
  country text DEFAULT 'US',
  timezone text DEFAULT 'America/New_York',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  address text NOT NULL,
  city text NOT NULL,
  state text,
  postal_code text,
  country text DEFAULT 'US',
  phone text,
  email text,
  manager_name text,
  timezone text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create organization_members table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  permissions jsonb DEFAULT '{}',
  invited_by uuid REFERENCES public.users(id),
  invited_at timestamptz,
  joined_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'organization_members_organization_id_user_id_key' 
        AND table_name = 'organization_members'
    ) THEN
        ALTER TABLE public.organization_members ADD CONSTRAINT organization_members_organization_id_user_id_key UNIQUE (organization_id, user_id);
    END IF;
END $$;

-- Create menu_templates table
CREATE TABLE IF NOT EXISTS public.menu_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  template_data jsonb NOT NULL,
  is_public boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_menus_user_id ON public.menus(user_id);
CREATE INDEX IF NOT EXISTS idx_menus_slug ON public.menus(slug);
CREATE INDEX IF NOT EXISTS idx_menus_active ON public.menus(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON public.menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_menu_slug ON public.analytics_events(menu_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_organization_id ON public.locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_locations_slug ON public.locations(slug);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_templates ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "menus_select_public" ON public.menus;
DROP POLICY IF EXISTS "menus_insert_own" ON public.menus;
DROP POLICY IF EXISTS "menus_update_own" ON public.menus;
DROP POLICY IF EXISTS "menus_delete_own" ON public.menus;
DROP POLICY IF EXISTS "menu_items_select_public" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_manage_own" ON public.menu_items;
DROP POLICY IF EXISTS "subscriptions_manage_own" ON public.subscriptions;
DROP POLICY IF EXISTS "analytics_insert_any" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_select_own" ON public.analytics_events;
DROP POLICY IF EXISTS "branding_manage_own" ON public.branding_settings;
DROP POLICY IF EXISTS "branding_select_public" ON public.branding_settings;
DROP POLICY IF EXISTS "organization_members_can_view" ON public.organizations;
DROP POLICY IF EXISTS "organization_owners_can_manage" ON public.organizations;
DROP POLICY IF EXISTS "location_members_can_view" ON public.locations;
DROP POLICY IF EXISTS "location_managers_can_manage" ON public.locations;
DROP POLICY IF EXISTS "members_can_view_org_members" ON public.organization_members;
DROP POLICY IF EXISTS "admins_can_manage_members" ON public.organization_members;
DROP POLICY IF EXISTS "public_can_view_public_templates" ON public.menu_templates;
DROP POLICY IF EXISTS "org_members_can_view_org_templates" ON public.menu_templates;

-- Create RLS policies
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "menus_select_public" ON public.menus FOR SELECT USING (is_active = true);
CREATE POLICY "menus_insert_own" ON public.menus FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "menus_update_own" ON public.menus FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "menus_delete_own" ON public.menus FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "menu_items_select_public" ON public.menu_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.menus WHERE menus.id = menu_items.menu_id AND menus.is_active = true)
);
CREATE POLICY "menu_items_manage_own" ON public.menu_items FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.menus WHERE id = menu_id)
);

CREATE POLICY "subscriptions_manage_own" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "analytics_insert_any" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "analytics_select_own" ON public.analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.menus WHERE menus.slug = analytics_events.menu_slug AND menus.user_id = auth.uid())
);

CREATE POLICY "branding_manage_own" ON public.branding_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "branding_select_public" ON public.branding_settings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.menus WHERE menus.user_id = branding_settings.user_id AND menus.is_active = true)
);

CREATE POLICY "organization_members_can_view" ON public.organizations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid()
    AND is_active = true
  )
);

CREATE POLICY "organization_owners_can_manage" ON public.organizations FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND is_active = true
  )
);

CREATE POLICY "location_members_can_view" ON public.locations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = locations.organization_id 
    AND user_id = auth.uid()
    AND is_active = true
  )
);

CREATE POLICY "location_managers_can_manage" ON public.locations FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = locations.organization_id 
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin', 'manager')
    AND is_active = true
  )
);

CREATE POLICY "members_can_view_org_members" ON public.organization_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om2
    WHERE om2.organization_id = organization_members.organization_id 
    AND om2.user_id = auth.uid()
    AND om2.is_active = true
  )
);

CREATE POLICY "admins_can_manage_members" ON public.organization_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = organization_members.organization_id 
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND is_active = true
  )
);

CREATE POLICY "public_can_view_public_templates" ON public.menu_templates FOR SELECT USING (is_public = true);
CREATE POLICY "org_members_can_view_org_templates" ON public.menu_templates FOR SELECT USING (
  organization_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = menu_templates.organization_id 
    AND user_id = auth.uid()
    AND is_active = true
  )
);

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "photos_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "photos_select_public" ON storage.objects;
DROP POLICY IF EXISTS "photos_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "photos_delete_authenticated" ON storage.objects;

-- Create storage policies
CREATE POLICY "photos_insert_authenticated" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'menu-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "photos_select_public" ON storage.objects 
FOR SELECT USING (bucket_id = 'menu-photos');

CREATE POLICY "photos_update_authenticated" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'menu-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "photos_delete_authenticated" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'menu-photos' 
  AND auth.role() = 'authenticated'
);

-- Create a demo organization and location for testing
DO $$
DECLARE
    demo_org_id uuid;
    demo_location_id uuid;
BEGIN
    -- Insert demo organization
    INSERT INTO public.organizations (name, slug, description, phone, address, city, state)
    VALUES (
        'Demo Restaurant Group',
        'demo-restaurant-group',
        'Sample restaurant chain for testing Scandish features',
        '(555) 987-6543',
        '123 Business Ave',
        'New York',
        'NY'
    )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO demo_org_id;

    -- Get organization ID if it already existed
    IF demo_org_id IS NULL THEN
        SELECT id INTO demo_org_id FROM public.organizations WHERE slug = 'demo-restaurant-group';
    END IF;

    -- Insert demo location
    INSERT INTO public.locations (organization_id, name, slug, address, city, state, manager_name)
    VALUES (
        demo_org_id, 
        'Demo Location', 
        'demo-location', 
        '123 Main St', 
        'New York', 
        'NY', 
        'Demo Manager'
    )
    ON CONFLICT (slug) DO NOTHING;

END $$;

-- Verify setup
SELECT 
    'Scandish Setup Complete!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
        'users', 'menus', 'menu_items', 'subscriptions', 'analytics_events', 
        'branding_settings', 'organizations', 'locations', 'organization_members', 'menu_templates'
    )) as tables_created,
    (SELECT COUNT(*) FROM storage.buckets WHERE id = 'menu-photos') as storage_buckets,
    (SELECT COUNT(*) FROM public.organizations) as sample_orgs,
    (SELECT COUNT(*) FROM public.locations) as sample_locations;
