# 🚨 Quick Fix for Supabase SQL Error

## The Problem
You're getting a SQL syntax error because you're trying to run the markdown file (`SUPABASE_SETUP.md`) instead of the SQL file.

## ✅ The Solution

### Step 1: Use the Correct SQL File
**Use this file:** `supabase/SCANDISH_SETUP_FINAL.sql` (NOT the markdown file)

### Step 2: Run in Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**
4. Copy the **entire contents** of `supabase/SCANDISH_SETUP_FINAL.sql`
5. Paste it into the SQL editor
6. Click **"Run"**

### Step 3: Verify Success
You should see output like:
```
Scandish Setup Complete!
tables_created: 10
storage_buckets: 1
sample_orgs: 1
sample_locations: 1
```

## 🔧 Environment Variables
Add these to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🎯 Test the Integration
1. Go to `/dashboard?section=locations`
2. Click "Add Location"
3. Fill out the form and submit
4. Location should appear in the list

## ✅ You're Done!
Your Supabase cloud integration is now working with real location management!

---

**Note:** The error happened because markdown files (`.md`) contain formatting like `#` which is not valid SQL syntax. Always use the `.sql` files for database setup.
