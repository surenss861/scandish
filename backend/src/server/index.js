/**
 * Scandish Backend - Entry Point
 *
 * Express server powering the Scandish API:
 * - Manages menus, analytics, billing, AI features
 * - Handles subscription webhooks (Whop, Stripe, etc.)
 * - Connects to Supabase via service role for persistence
 * - Provides sample data seeding for local development
 *
 * Default port: 4000 (override with `PORT` in .env)
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Route imports
const menuRoutes = require("./routes/menus");
const billingRoutes = require("./routes/billing");
const analyticsRoutes = require("./routes/analytics");
const aiRoutes = require("./routes/ai");
const organizationRoutes = require("./routes/organizations");

// Jobs + utils
const { AIInsightsJob } = require("./jobs/aiInsightsJob");
const { SampleDataSeeder } = require("./utils/sampleDataSeeder");
const { supabase } = require("./services/supabase");

const app = express();

/* ----------------------------- Middleware ----------------------------- */

// Allow frontend requests (defaults to allow all if FRONTEND_URL not set)
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));

// Parse JSON (⚠️ webhooks may need raw parsing)
app.use(express.json());

/* ------------------------------- Routes ------------------------------- */

// Health check
app.get("/health", (_, res) => res.json({ status: "ok" }));

// Core API
app.use("/api/menus", menuRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/organizations", organizationRoutes);

// Dev-only sample data
app.post("/api/seed-sample-data", async (req, res) => {
  try {
    const { userId, userEmail } = req.body;
    if (!userId || !userEmail) {
      return res.status(400).json({ error: "userId and userEmail required" });
    }

    const success = await SampleDataSeeder.seedCurrentUser({ id: userId, email: userEmail });
    return success
      ? res.json({ success: true, message: "Sample data seeded successfully" })
      : res.status(500).json({ error: "Failed to seed sample data" });
  } catch (err) {
    console.error("[Seed] Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ----------------------------- Webhooks ----------------------------- */

// Whop integration
app.post("/webhooks/whop", async (req, res) => {
  try {
    const { event, data } = req.body;
    console.log(`[Whop] Event received: ${event}`);

    switch (event) {
      case "payment.completed": {
        const { user_id, plan } = data;
        if (user_id && plan) {
          await supabase.from("subscriptions").upsert({
            user_id,
            plan,
            status: "active",
            updated_at: new Date().toISOString(),
          });
          console.log(`[Whop] ✅ Subscription activated → user ${user_id}, plan ${plan}`);
        }
        break;
      }

      case "subscription.cancelled": {
        const { user_id } = data;
        if (user_id) {
          await supabase
            .from("subscriptions")
            .update({
              plan: "free",
              status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user_id);
          console.log(`[Whop] ❌ Subscription cancelled → user ${user_id}`);
        }
        break;
      }

      default:
        console.log(`[Whop] ⚠️ Unhandled event type: ${event}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("[Whop] Webhook handler error:", err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

/* ----------------------------- Server Init ----------------------------- */

const port = parseInt(process.env.PORT, 10) || 4000;
app.listen(port, () => {
  console.log(`🚀 Scandish backend running at http://localhost:${port}`);

  // Kick off background jobs
  console.log("🤖 Scheduling AI Insights Job...");
  AIInsightsJob.scheduleNightly();
});
