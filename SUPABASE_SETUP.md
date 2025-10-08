# 🚀 Supabase Cloud Setup for Scandish

This guide will help you set up Supabase cloud integration for your Scandish application, including location management functionality.

## 📋 Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **New Project**: Create a new Supabase project
3. **Environment Variables**: Get your project URL and anon key

## 🔧 Setup Steps

### 1. Database Setup

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the entire contents of `supabase/SCANDISH_SETUP_FINAL.sql`**
4. **Run the SQL script** - This will create:
   - All necessary tables (users, menus, organizations, locations, etc.)
   - Row Level Security (RLS) policies
   - Storage buckets for menu photos
   - Sample data for testing

### 2. Environment Variables

Add these to your `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Where to find these values:**
- Go to your Supabase project dashboard
- Click on "Settings" → "API"
- Copy the "Project URL" and "anon public" key
- Copy the "service_role" key (keep this secret!)

### 3. Authentication Setup

1. **Enable Email Authentication:**
   - Go to Authentication → Settings
   - Enable "Enable email confirmations" (optional)
   - Configure your site URL: `http://localhost:5173` (for development)

2. **Update the Demo User ID:**
   - In the SQL script, find the line: `demo_user_id uuid := '00000000-0000-0000-0000-000000000001';`
   - Replace this with your actual user ID from `auth.users` table
   - Or create a user through the Supabase Auth interface first

### 4. Storage Setup

The SQL script automatically creates a storage bucket called `menu-photos`. To configure it:

1. Go to Storage in your Supabase dashboard
2. The `menu-photos` bucket should be visible
3. Configure policies as needed (the script sets up basic policies)

## 🎯 Features Enabled

With this setup, you'll have:

### ✅ **Location Management**
- Create, read, update, delete locations
- Organization-based access control
- Role-based permissions (owner, admin, manager, member)

### ✅ **Multi-Location Support**
- Restaurant chains can manage multiple locations
- Each location can have its own menus
- Centralized organization management

### ✅ **User Management**
- User authentication via Supabase Auth
- Organization membership and roles
- Secure data access with RLS policies

### ✅ **Menu Management**
- Location-specific menus
- Menu items with photos (stored in Supabase Storage)
- Public menu URLs with QR codes

### ✅ **Analytics**
- Menu scan tracking
- Item click analytics
- Location-specific metrics

## 🧪 Testing

### 1. Test Location Creation
1. Go to `/dashboard?section=locations`
2. Click "Add Location"
3. Fill out the form and submit
4. Location should appear in the list

### 2. Test Organization Management
1. The system automatically creates an organization when you create your first location
2. Check the `organizations` table in Supabase to see your data

### 3. Test Permissions
- Only users with proper roles can create/edit locations
- RLS policies ensure users only see their own organization's data

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access their own organization's data
- Location access is controlled by organization membership
- Menu access is controlled by ownership

### Role-Based Access Control
- **Owner**: Full access to organization and all locations
- **Admin**: Full access to organization and locations
- **Manager**: Can manage assigned locations
- **Member**: Read-only access to organization data

## 📊 Database Schema

### Core Tables
- `users` - Restaurant owner profiles
- `organizations` - Restaurant chains/companies
- `locations` - Individual restaurant locations
- `organization_members` - Team access management
- `menus` - Restaurant menus
- `menu_items` - Individual dishes
- `analytics_events` - Usage tracking

### Storage
- `menu-photos` bucket for menu item images

## 🚨 Troubleshooting

### Common Issues

1. **"Organization not found" error:**
   - Make sure you've run the complete SQL setup script
   - Verify your user ID in the demo data section

2. **Permission denied errors:**
   - Check that RLS policies are enabled
   - Verify user has proper organization membership

3. **Location creation fails:**
   - Ensure user is authenticated
   - Check browser console for detailed error messages
   - Verify backend is running on port 4000

### Debug Steps

1. **Check Supabase Logs:**
   - Go to Logs in your Supabase dashboard
   - Look for any error messages

2. **Verify Environment Variables:**
   - Make sure all Supabase keys are correctly set
   - Restart your development servers after changing .env

3. **Test API Endpoints:**
   ```bash
   # Test backend health
   curl http://localhost:4000/health
   
   # Test locations endpoint (requires auth)
   curl http://localhost:4000/api/locations/mine
   ```

## 🎉 You're Ready!

Your Scandish application now has full Supabase cloud integration with:
- ✅ Real-time location management
- ✅ Multi-location restaurant support
- ✅ Secure user authentication
- ✅ Role-based access control
- ✅ Scalable database architecture

**Next Steps:**
1. Create your first location through the UI
2. Set up your restaurant's branding
3. Create menus for your locations
4. Share your menu URLs with customers!

---

**Need Help?** Check the Supabase documentation or create an issue in the project repository.
