-- ============================================================================
-- SCANDISH COMPLETE SETUP - PRODUCTION READY
-- ============================================================================
-- Paste this entire script into your Supabase SQL Editor
-- Includes: Core tables, Enterprise features, Sample data, Storage setup
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================

-- Create storage bucket for menu photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-photos', 
  'menu-photos', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

/*
 * users - Restaurant owner profiles
 */
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  restaurant_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

/*
 * menus - Restaurant menus with public URLs
 */
CREATE TABLE IF NOT EXISTS public.menus (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

/*
 * menu_items - Individual dishes with photo support
 */
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

/*
 * subscriptions - Whop billing integration
 */
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  whop_customer_id text UNIQUE,
  whop_subscription_id text UNIQUE,
  billing_email text,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

/*
 * analytics_events - Track menu scans and clicks
 */
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

/*
 * branding_settings - Custom logos and colors for Pro users
 */
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

-- ============================================================================
-- ENTERPRISE TABLES
-- ============================================================================

/*
 * organizations - Parent company for restaurant chains
 */
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

/*
 * locations - Individual restaurant locations
 */
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

/*
 * organization_members - Team access management
 */
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

/*
 * menu_templates - Reusable menu templates
 */
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

-- ============================================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

DO $$ 
BEGIN
  -- Add missing columns to menus
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menus' AND column_name = 'description') THEN
    ALTER TABLE public.menus ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menus' AND column_name = 'is_active') THEN
    ALTER TABLE public.menus ADD COLUMN is_active boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menus' AND column_name = 'location_id') THEN
    ALTER TABLE public.menus ADD COLUMN location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menus' AND column_name = 'organization_id') THEN
    ALTER TABLE public.menus ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;
  END IF;
  
  -- Add missing columns to menu_items
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'image_url') THEN
    ALTER TABLE public.menu_items ADD COLUMN image_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'image_path') THEN
    ALTER TABLE public.menu_items ADD COLUMN image_path text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'is_available') THEN
    ALTER TABLE public.menu_items ADD COLUMN is_available boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'updated_at') THEN
    ALTER TABLE public.menu_items ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
  
  -- Add missing columns to subscriptions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'organization_id') THEN
    ALTER TABLE public.subscriptions ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'seat_count') THEN
    ALTER TABLE public.subscriptions ADD COLUMN seat_count integer DEFAULT 1;
  END IF;
END $$;

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_menus_user_id ON public.menus(user_id);
CREATE INDEX IF NOT EXISTS idx_menus_slug ON public.menus(slug);
CREATE INDEX IF NOT EXISTS idx_menus_active ON public.menus(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON public.menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available) WHERE is_available = true;

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_menu_slug ON public.analytics_events(menu_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_menu_id ON public.analytics_events(menu_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_is_bot ON public.analytics_events(is_bot) WHERE is_bot = false;

-- Enterprise indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_organization_id ON public.locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_locations_slug ON public.locations(slug);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id);

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ============================================================================
-- ROW LEVEL SECURITY SETUP
-- ============================================================================

-- Enable RLS on all tables
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

-- ============================================================================
-- SECURITY POLICIES (SAFE - HANDLES EXISTING)
-- ============================================================================

-- Drop and recreate policies to handle existing ones
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Menus policies
DROP POLICY IF EXISTS "menus_select_public" ON public.menus;
DROP POLICY IF EXISTS "menus_insert_own" ON public.menus;
DROP POLICY IF EXISTS "menus_update_own" ON public.menus;
DROP POLICY IF EXISTS "menus_delete_own" ON public.menus;
CREATE POLICY "menus_select_public" ON public.menus FOR SELECT USING (is_active = true);
CREATE POLICY "menus_insert_own" ON public.menus FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "menus_update_own" ON public.menus FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "menus_delete_own" ON public.menus FOR DELETE USING (auth.uid() = user_id);

-- Menu items policies
DROP POLICY IF EXISTS "menu_items_select_public" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_manage_own" ON public.menu_items;
CREATE POLICY "menu_items_select_public" ON public.menu_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.menus WHERE menus.id = menu_items.menu_id AND menus.is_active = true)
);
CREATE POLICY "menu_items_manage_own" ON public.menu_items FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.menus WHERE id = menu_id)
);

-- Subscriptions policies
DROP POLICY IF EXISTS "subscriptions_manage_own" ON public.subscriptions;
CREATE POLICY "subscriptions_manage_own" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

-- Analytics policies
DROP POLICY IF EXISTS "analytics_insert_any" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_select_own" ON public.analytics_events;
CREATE POLICY "analytics_insert_any" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "analytics_select_own" ON public.analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.menus WHERE menus.slug = analytics_events.menu_slug AND menus.user_id = auth.uid())
);

-- Branding policies
DROP POLICY IF EXISTS "branding_manage_own" ON public.branding_settings;
DROP POLICY IF EXISTS "branding_select_public" ON public.branding_settings;
CREATE POLICY "branding_manage_own" ON public.branding_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "branding_select_public" ON public.branding_settings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.menus WHERE menus.user_id = branding_settings.user_id AND menus.is_active = true)
);

-- Organization policies
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

-- Location policies
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

-- Organization members policies
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

-- Menu templates policies
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

-- ============================================================================
-- STORAGE POLICIES (SAFE - HANDLES EXISTING)
-- ============================================================================

DROP POLICY IF EXISTS "photos_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "photos_select_public" ON storage.objects;
DROP POLICY IF EXISTS "photos_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "photos_delete_authenticated" ON storage.objects;

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

-- ============================================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add missing columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS restaurant_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;

-- Add missing columns to menus table  
ALTER TABLE public.menus ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.menus ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.menus ADD COLUMN IF NOT EXISTS location_id uuid;
ALTER TABLE public.menus ADD COLUMN IF NOT EXISTS organization_id uuid;

-- Add missing columns to menu_items table
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS image_path text;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add missing columns to subscriptions table
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS organization_id uuid;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS seat_count integer DEFAULT 1;

-- Add unique constraint on user_id if it doesn't exist
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

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Create demo user (replace with your actual auth user ID)
DO $$
DECLARE
    demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
    demo_org_id uuid;
    demo_menu_id uuid;
    demo_menu2_id uuid;
    demo_location_id uuid;
BEGIN
    -- Note: Replace 'demo-user-id-replace-me' with your actual user ID from auth.users
    
    -- Insert demo user
    INSERT INTO public.users (id, email, restaurant_name, phone)
    VALUES (demo_user_id, 'demo@scandish.ca', 'Demo Restaurant', '(555) 123-4567')
    ON CONFLICT (id) DO UPDATE SET 
        restaurant_name = EXCLUDED.restaurant_name,
        phone = EXCLUDED.phone;

    -- Insert demo subscription (Pro plan)
    INSERT INTO public.subscriptions (user_id, plan, status)
    VALUES (demo_user_id, 'pro', 'active')
    ON CONFLICT (user_id) DO UPDATE SET 
        plan = EXCLUDED.plan,
        status = EXCLUDED.status;

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

    -- Insert organization member
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (demo_org_id, demo_user_id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    -- Insert demo locations
    INSERT INTO public.locations (organization_id, name, slug, address, city, state, manager_name)
    VALUES 
        (demo_org_id, 'Downtown Location', 'demo-downtown', '123 Main St', 'New York', 'NY', 'Sarah Johnson'),
        (demo_org_id, 'Airport Branch', 'demo-airport', '456 Terminal Dr', 'New York', 'NY', 'Mike Chen'),
        (demo_org_id, 'Midtown Restaurant', 'demo-midtown', '789 Broadway', 'New York', 'NY', 'Lisa Rodriguez')
    ON CONFLICT (slug) DO NOTHING;

    -- Get first location ID
    SELECT id INTO demo_location_id FROM public.locations WHERE slug = 'demo-downtown';

    -- Insert demo menus
    INSERT INTO public.menus (user_id, slug, title, description, organization_id, location_id, is_active)
    VALUES 
        (demo_user_id, 'demo-main-menu', 'Main Menu', 'Our signature dishes and favorites', demo_org_id, demo_location_id, true),
        (demo_user_id, 'demo-drinks-menu', 'Beverages', 'Craft cocktails, wines, and specialty drinks', demo_org_id, demo_location_id, true)
    ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title;

    -- Get menu IDs
    SELECT id INTO demo_menu_id FROM public.menus WHERE slug = 'demo-main-menu';
    SELECT id INTO demo_menu2_id FROM public.menus WHERE slug = 'demo-drinks-menu';

    -- Insert demo menu items for main menu (if they don't exist)
    INSERT INTO public.menu_items (menu_id, name, description, price, category, emoji, sort_order, is_available)
    SELECT demo_menu_id, 'Margherita Pizza', 'Fresh mozzarella, tomato sauce, and basil', 16.99, 'Pizza', '🍕', 0, true
    WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE menu_id = demo_menu_id AND name = 'Margherita Pizza');
    
    INSERT INTO public.menu_items (menu_id, name, description, price, category, emoji, sort_order, is_available)
    SELECT demo_menu_id, 'Caesar Salad', 'Crisp romaine, parmesan, croutons, caesar dressing', 12.99, 'Salads', '🥗', 1, true
    WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE menu_id = demo_menu_id AND name = 'Caesar Salad');
    
    INSERT INTO public.menu_items (menu_id, name, description, price, category, emoji, sort_order, is_available)
    SELECT demo_menu_id, 'Pasta Carbonara', 'Traditional Roman pasta with eggs, cheese, and pancetta', 18.99, 'Pasta', '🍝', 2, true
    WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE menu_id = demo_menu_id AND name = 'Pasta Carbonara');
    
    INSERT INTO public.menu_items (menu_id, name, description, price, category, emoji, sort_order, is_available)
    SELECT demo_menu_id, 'Grilled Salmon', 'Atlantic salmon with seasonal vegetables', 24.99, 'Seafood', '🐟', 3, true
    WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE menu_id = demo_menu_id AND name = 'Grilled Salmon');
    
    INSERT INTO public.menu_items (menu_id, name, description, price, category, emoji, sort_order, is_available)
    SELECT demo_menu_id, 'Tiramisu', 'Classic Italian dessert with coffee and mascarpone', 8.99, 'Desserts', '🍰', 4, true
    WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE menu_id = demo_menu_id AND name = 'Tiramisu');

    -- Insert demo menu items for drinks menu (if they don't exist)
    INSERT INTO public.menu_items (menu_id, name, description, price, category, emoji, sort_order, is_available)
    SELECT demo_menu2_id, 'Craft Beer', 'Local brewery selection on tap', 6.99, 'Beer', '🍺', 0, true
    WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE menu_id = demo_menu2_id AND name = 'Craft Beer');
    
    INSERT INTO public.menu_items (menu_id, name, description, price, category, emoji, sort_order, is_available)
    SELECT demo_menu2_id, 'House Wine', 'Red or white wine by the glass', 9.99, 'Wine', '🍷', 1, true
    WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE menu_id = demo_menu2_id AND name = 'House Wine');
    
    INSERT INTO public.menu_items (menu_id, name, description, price, category, emoji, sort_order, is_available)
    SELECT demo_menu2_id, 'Craft Cocktail', 'Artisanal cocktails made fresh', 12.99, 'Cocktails', '🍸', 2, true
    WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE menu_id = demo_menu2_id AND name = 'Craft Cocktail');
    
    INSERT INTO public.menu_items (menu_id, name, description, price, category, emoji, sort_order, is_available)
    SELECT demo_menu2_id, 'Fresh Juice', 'Daily selection of cold-pressed juices', 5.99, 'Non-Alcoholic', '🧃', 3, true
    WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE menu_id = demo_menu2_id AND name = 'Fresh Juice');

END $$;

-- ============================================================================
-- SAMPLE ANALYTICS DATA
-- ============================================================================

-- Generate 30 days of realistic analytics events
DO $$
DECLARE
    menu_slugs text[] := ARRAY['demo-main-menu', 'demo-drinks-menu'];
    item_names text[] := ARRAY['Margherita Pizza', 'Caesar Salad', 'Pasta Carbonara', 'Grilled Salmon', 'Tiramisu', 'Craft Beer', 'House Wine', 'Craft Cocktail'];
    base_date timestamptz;
    event_date timestamptz;
    menu_slug text;
    item_name text;
    is_mobile boolean;
    i integer;
    j integer;
    events_per_day integer;
BEGIN
    -- Generate events for the last 30 days
    FOR i IN 0..29 LOOP
        base_date := now() - (i || ' days')::interval;
        events_per_day := 15 + floor(random() * 35)::integer; -- 15-50 events per day
        
        FOR j IN 1..events_per_day LOOP
            -- Random time during business hours (7 AM to 10 PM)
            event_date := base_date + 
                         (floor(random() * 15) + 7)::integer * interval '1 hour' + 
                         (floor(random() * 60))::integer * interval '1 minute';
            
            menu_slug := menu_slugs[1 + floor(random() * array_length(menu_slugs, 1))::integer];
            is_mobile := random() > 0.22; -- 78% mobile traffic
            
            -- Insert menu view event
            INSERT INTO public.analytics_events (
                event_type, menu_slug, timestamp, is_mobile, is_bot, 
                user_agent, ip_hash, session_id, device_type
            ) VALUES (
                'menu_view',
                menu_slug,
                event_date,
                is_mobile,
                false,
                CASE WHEN is_mobile THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)' ELSE 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' END,
                substr(md5(random()::text), 1, 16),
                substr(md5(random()::text), 1, 12),
                CASE WHEN is_mobile THEN 'mobile' ELSE 'desktop' END
            );
            
            -- 25% chance of item click after view
            IF random() > 0.75 THEN
                item_name := item_names[1 + floor(random() * array_length(item_names, 1))::integer];
                
                INSERT INTO public.analytics_events (
                    event_type, menu_slug, item_name, timestamp, is_mobile, is_bot,
                    user_agent, ip_hash, session_id, device_type
                ) VALUES (
                    'item_click',
                    menu_slug,
                    item_name,
                    event_date + (random() * 30)::integer * interval '1 second',
                    is_mobile,
                    false,
                    CASE WHEN is_mobile THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)' ELSE 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' END,
                    substr(md5(random()::text), 1, 16),
                    substr(md5(random()::text), 1, 12),
                    CASE WHEN is_mobile THEN 'mobile' ELSE 'desktop' END
                );
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get analytics summary for a user
CREATE OR REPLACE FUNCTION get_user_analytics_summary(user_id uuid, days integer DEFAULT 7)
RETURNS TABLE (
    total_scans bigint,
    total_clicks bigint,
    mobile_percentage numeric,
    top_item text,
    top_item_clicks bigint
) AS $$
BEGIN
    RETURN QUERY
    WITH user_events AS (
        SELECT ae.*
        FROM public.analytics_events ae
        JOIN public.menus m ON m.slug = ae.menu_slug
        WHERE m.user_id = user_id
        AND ae.timestamp >= now() - (days || ' days')::interval
        AND ae.is_bot = false
    ),
    scans AS (
        SELECT COUNT(*) as count FROM user_events WHERE event_type = 'menu_view'
    ),
    clicks AS (
        SELECT COUNT(*) as count FROM user_events WHERE event_type = 'item_click'
    ),
    mobile_stats AS (
        SELECT 
            COUNT(*) FILTER (WHERE is_mobile = true) as mobile_count,
            COUNT(*) as total_count
        FROM user_events WHERE event_type = 'menu_view'
    ),
    top_items AS (
        SELECT item_name, COUNT(*) as click_count
        FROM user_events 
        WHERE event_type = 'item_click' AND item_name IS NOT NULL
        GROUP BY item_name
        ORDER BY click_count DESC
        LIMIT 1
    )
    SELECT 
        s.count,
        c.count,
        CASE WHEN ms.total_count > 0 THEN ROUND((ms.mobile_count::numeric / ms.total_count::numeric) * 100, 1) ELSE 0 END,
        ti.item_name,
        ti.click_count
    FROM scans s
    CROSS JOIN clicks c
    CROSS JOIN mobile_stats ms
    LEFT JOIN top_items ti ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this to verify everything was created successfully
SELECT 
    'Scandish Setup Complete! 🎉' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
        'users', 'menus', 'menu_items', 'subscriptions', 'analytics_events', 
        'branding_settings', 'organizations', 'locations', 'organization_members', 'menu_templates'
    )) as tables_created,
    (SELECT COUNT(*) FROM storage.buckets WHERE id = 'menu-photos') as storage_buckets,
    (SELECT COUNT(*) FROM public.menus WHERE slug LIKE 'demo-%') as sample_menus,
    (SELECT COUNT(*) FROM public.menu_items) as sample_items,
    (SELECT COUNT(*) FROM public.analytics_events) as sample_events,
    (SELECT COUNT(*) FROM public.organizations) as sample_orgs,
    (SELECT COUNT(*) FROM public.locations) as sample_locations;

-- ============================================================================
-- SETUP INSTRUCTIONS
-- ============================================================================

-- After running this script:
-- 1. Update the demo_user_id in the sample data section with your real auth.users ID
-- 2. Set your environment variables in your app
-- 3. Test all features with real data
-- 4. The sample data provides:
--    • 2 sample menus with 9 menu items total
--    • 30 days of realistic analytics events (~900 events)
--    • 1 organization with 3 locations
--    • Pro subscription for full feature access
--    • Proper RLS policies for security

-- Your Scandish platform is now ready with real data! 🚀

SELECT 'Database ready! Replace demo_user_id with your auth.users ID to activate sample data.' as next_step;
