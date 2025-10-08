# 🔧 Environment Setup Guide

## Create Your `.env` File

Create a `.env` file in your project root directory (`D:\scandish\.env`) with the following content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Backend Configuration
PORT=4000
FRONTEND_URL=http://localhost:5173
```

## How to Get Your Supabase Credentials

1. **Go to your Supabase project dashboard**
2. **Click on "Settings" → "API"**
3. **Copy the following values:**
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY`

## Example `.env` File

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## After Creating `.env`:

1. **Restart your servers:**
   ```bash
   # Stop all Node.js processes
   taskkill /F /IM node.exe
   
   # Start backend
   cd backend && node src/index.js
   
   # Start frontend (in new terminal)
   cd frontend && npm run dev
   ```

2. **Set up your database** using `supabase/SCANDISH_SETUP_FINAL.sql`

3. **Test location creation** - it should work now!

## Troubleshooting

- **"Unauthorized" errors**: Make sure your Supabase credentials are correct
- **"Connection refused"**: Make sure both servers are running
- **"Failed to create location"**: Check that the database is set up and you're logged in
