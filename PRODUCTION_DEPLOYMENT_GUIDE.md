# PRODUCTION DEPLOYMENT GUIDE FOR SCANDISH.CA

## Environment Variables Required

Create a `.env` file in the root directory with these variables:

```bash
# Frontend URL
VITE_FRONTEND_URL=https://scandish.ca
VITE_BACKEND_URL=https://api.scandish.ca

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Server Configuration
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://scandish.ca

# CORS Configuration
CORS_ORIGIN=https://scandish.ca

# Database Configuration
DATABASE_URL=your_database_url_here

# Security
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
```

## Backend Production Configuration

Update `backend/src/index.js`:

```javascript
// Enable CORS for production domain
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || "https://scandish.ca",
  credentials: true
}));
```

## Frontend Production Configuration

Update `frontend/vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": process.env.VITE_BACKEND_URL || "https://api.scandish.ca"
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  define: {
    __SCANDISH_BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
```

## Deployment Steps

1. **Backend Deployment:**
   - Deploy to your backend server (e.g., Railway, Render, DigitalOcean)
   - Set environment variables
   - Ensure SSL certificate is configured
   - Point api.scandish.ca to your backend server

2. **Frontend Deployment:**
   - Build: `npm run build`
   - Deploy to Vercel/Netlify
   - Set environment variables
   - Point scandish.ca to your frontend deployment

3. **Database Setup:**
   - Run the SQL script: `supabase/SCANDISH_SETUP_FINAL.sql`
   - Configure RLS policies
   - Set up backups

4. **Domain Configuration:**
   - Point scandish.ca to frontend
   - Point api.scandish.ca to backend
   - Configure SSL certificates

## Security Checklist

- [ ] SSL certificates configured
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database RLS policies active
- [ ] Stripe webhooks configured
- [ ] Rate limiting enabled
- [ ] Error logging configured

## Performance Optimizations

- [ ] Enable gzip compression
- [ ] Configure CDN
- [ ] Optimize images
- [ ] Enable caching headers
- [ ] Database indexing
- [ ] API response optimization

