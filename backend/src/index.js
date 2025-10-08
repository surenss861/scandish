/*
 * Entry point for the Scandish backend.
 *
 * This Express server exposes API endpoints for managing menus, generates public
 * menu pages, and handles Stripe webhook events.  It proxies database
 * interactions through Supabase using a service role key.  In development
 * the server runs on port 4000 by default; adjust the `PORT` variable in
 * `.env` as needed.
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Import custom modules
const menuRoutes = require("./routes/menus");
const billingRoutes = require("./routes/billing");
const analyticsRoutes = require("./routes/analytics");
const brandingRoutes = require("./routes/branding");
const stripeRoutes = require("./routes/stripe");
const templateRoutes = require("./routes/templates");
const locationRoutes = require("./routes/locations");
const organizationRoutes = require("./routes/organizations");

// Import background jobs
const { SampleDataSeeder } = require("./utils/sampleDataSeeder");

const app = express();

// Enable CORS for production domain
app.use(cors({
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "https://scandish.ca",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Parse JSON bodies. For Stripe webhooks we will override this with raw
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use("/api/menus", menuRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/branding", brandingRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api", stripeRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Sample data seeding endpoint (for testing)
app.post("/api/seed-sample-data", express.json(), async (req, res) => {
  try {
    const { userId, userEmail } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({ error: "userId and userEmail required" });
    }

    const success = await SampleDataSeeder.seedCurrentUser({
      id: userId,
      email: userEmail,
    });

    if (success) {
      res.json({ success: true, message: "Sample data seeded successfully" });
    } else {
      res.status(500).json({ error: "Failed to seed sample data" });
    }
  } catch (error) {
    console.error("Sample data seeding error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/*
 * Whop webhook endpoint (optional - for future webhook integration)
 */
app.post("/webhooks/whop", express.json(), async (req, res) => {
  try {
    const { event, data } = req.body;

    console.log(`[Whop] Received event: ${event}`);

    // Handle Whop webhook events
    switch (event) {
      case "payment.completed": {
        const { user_id, plan } = data;

        if (user_id && plan) {
          const { supabase } = require("./services/supabase");
          await supabase.from("subscriptions").upsert({
            user_id,
            plan,
            status: "active",
            updated_at: new Date().toISOString(),
          });

          console.log(
            `[Whop] Subscription activated for user ${user_id}, plan: ${plan}`
          );
        }
        break;
      }

      case "subscription.cancelled": {
        const { user_id } = data;

        if (user_id) {
          const { supabase } = require("./services/supabase");
          await supabase
            .from("subscriptions")
            .update({
              plan: "free",
              status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user_id);

          console.log(`[Whop] Subscription cancelled for user ${user_id}`);
        }
        break;
      }

      default:
        console.log(`[Whop] Unhandled event type: ${event}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Whop] Webhook handler error:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
});

// 🚀 Backend port
const port = parseInt(process.env.PORT, 10) || 4000;
app.listen(port, () => {
  console.log(`🚀 Backend listening on http://localhost:${port}`);

  // Initialize background jobs
});
