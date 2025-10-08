-- ============================================================================
-- SCANDISH PRODUCTION SETUP - NO DEMO DATA
-- ============================================================================
-- Clean database setup without any demo accounts or sample data
-- Ready for your real restaurant data
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STORAGE BUCKET
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-photos', 
  'menu-photos', 
  true, 
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  restaurant_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Menus table
CREATE TABLE IF NOT EXISTS public.menus (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  location_id uuid,
  organization_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Menu items table
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

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  whop_customer_id text UNIQUE,
  whop_subscription_id text UNIQUE,
  billing_email text,
  organization_id uuid,
  seat_count integer DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Analytics events table
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

-- Branding settings table
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
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Organizations table
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

-- Locations table
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

-- Organization members table
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
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Add foreign key constraints to menus
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.menus ADD CONSTRAINT menus_location_id_fkey 
        FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.menus ADD CONSTRAINT menus_organization_id_fkey 
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_organization_id_fkey 
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_menus_user_id ON public.menus(user_id);
CREATE INDEX IF NOT EXISTS idx_menus_slug ON public.menus(slug);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON public.menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_menu_slug ON public.analytics_events(menu_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_organization_id ON public.locations(organization_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECURITY POLICIES
-- ============================================================================

-- Drop and recreate all policies to handle existing ones
DROP POLICY IF EXISTS "users_all" ON public.users;
CREATE POLICY "users_all" ON public.users FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "menus_public_select" ON public.menus;
DROP POLICY IF EXISTS "menus_owner_manage" ON public.menus;
CREATE POLICY "menus_public_select" ON public.menus FOR SELECT USING (is_active = true);
CREATE POLICY "menus_owner_manage" ON public.menus FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "menu_items_public_select" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_owner_manage" ON public.menu_items;
CREATE POLICY "menu_items_public_select" ON public.menu_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.menus WHERE menus.id = menu_items.menu_id AND menus.is_active = true)
);
CREATE POLICY "menu_items_owner_manage" ON public.menu_items FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.menus WHERE id = menu_id)
);

DROP POLICY IF EXISTS "subscriptions_owner_manage" ON public.subscriptions;
CREATE POLICY "subscriptions_owner_manage" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "analytics_public_insert" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_owner_select" ON public.analytics_events;
CREATE POLICY "analytics_public_insert" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "analytics_owner_select" ON public.analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.menus WHERE menus.slug = analytics_events.menu_slug AND menus.user_id = auth.uid())
);

DROP POLICY IF EXISTS "branding_owner_manage" ON public.branding_settings;
CREATE POLICY "branding_owner_manage" ON public.branding_settings FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "organizations_members_manage" ON public.organizations;
CREATE POLICY "organizations_members_manage" ON public.organizations FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid()
    AND is_active = true
  )
);

DROP POLICY IF EXISTS "locations_members_manage" ON public.locations;
CREATE POLICY "locations_members_manage" ON public.locations FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = locations.organization_id 
    AND user_id = auth.uid()
    AND is_active = true
  )
);

DROP POLICY IF EXISTS "org_members_view" ON public.organization_members;
CREATE POLICY "org_members_view" ON public.organization_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om2
    WHERE om2.organization_id = organization_members.organization_id 
    AND om2.user_id = auth.uid()
    AND om2.is_active = true
  )
);

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "photos_authenticated" ON storage.objects;
CREATE POLICY "photos_authenticated" ON storage.objects FOR ALL USING (bucket_id = 'menu-photos');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
    '🎉 Scandish Database Ready!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
        'users', 'menus', 'menu_items', 'subscriptions', 'analytics_events', 
        'branding_settings', 'organizations', 'locations', 'organization_members'
    )) as tables_created,
    (SELECT COUNT(*) FROM storage.buckets WHERE id = 'menu-photos') as storage_ready;

-- ============================================================================
-- CLEAN DATABASE READY!
-- ============================================================================

-- Your Scandish database is now ready with:
-- ✅ All tables created with proper relationships
-- ✅ Photo storage bucket configured  
-- ✅ Security policies for data protection
-- ✅ Performance indexes for fast queries
-- ✅ NO demo data - clean slate for your restaurant
--
-- Next steps:
-- 1. Sign up at your app with your real email
-- 2. Create your first menu in the dashboard
-- 3. Use the "Load Sample Data" button if you need test data
-- 4. All premium features are ready to use!

SELECT 'Clean database ready for your real restaurant data! 🚀' as ready;
