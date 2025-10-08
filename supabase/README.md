# Supabase Setup Guide

This directory contains scripts and notes related to the Supabase backend for Scandish.

## 📦 Schema

Use `PRODUCTION_SETUP.sql` for a clean, idempotent setup of all tables (core + enterprise), storage and RLS policies. To apply it:

1. Open the **SQL editor** in your Supabase dashboard.
2. Copy the contents of `PRODUCTION_SETUP.sql` and paste it into a new query.
3. Run the query.  It's idempotent, so running it multiple times will not recreate existing tables.

The script assumes that the `uuid-ossp` extension is enabled.  If you encounter an error, run:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## 📷 Storage Setup

For photo uploads to work, you need to create a Storage bucket:

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it `menu-photos`
4. Set it to **Public bucket** (for easy image serving)
5. Click **Create bucket**

### Storage Policies (already covered in PRODUCTION_SETUP.sql)

Add these RLS policies for the storage bucket:

```sql
-- Allow authenticated users to upload photos
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'Users can upload menu photos', 
  'menu-photos',
  'auth.role() = ''authenticated'''
);

-- Allow public read access to photos
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'Public can view menu photos',
  'menu-photos', 
  'true'
);
```

Or set these policies in the Supabase Dashboard:
- **Storage > menu-photos > Policies**
- **INSERT**: `auth.role() = 'authenticated'`
- **SELECT**: `true` (public read access)

## 🔐 Row Level Security

RLS is enabled for all tables. The provided policies allow only the owner (identified by `auth.uid()`) and organization members to access their data. This makes it safe for your client application to interact with Supabase directly using the logged‑in user’s JWT.

To test the policies, create a user via Supabase Auth and insert a row into the `users` table with the same `id` as the auth user (you can automate this via a sign‑up webhook).  Then open SQL browser and try to select and update your tables using the JWT from that user.

## 🛠️ Tips

- Supabase provides a built‑in REST API and client library.  For the frontend, you can create a supabase client using the project URL and **anon** key:

  ```js
  import { createClient } from '@supabase/supabase-js';
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
  ```

- Use the **service role key** in your backend server.  Never expose it to the client – it bypasses all RLS checks.

- To support additional features (analytics, specials, multilingual menus, etc.), consider adding more tables and policies.  Supabase’s row‑level security makes it straightforward to build multi‑tenant applications.

If you run into issues or want to extend the schema, refer to the [Supabase documentation](https://supabase.com/docs).