// backend/routes/organizations.js

const express = require("express");
const router = express.Router();
const { supabase } = require("../services/supabase");
const requireAuth = require("../middleware/auth");

/**
 * GET /api/organizations/mine
 * Return the organization + locations for the logged-in user
 */
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check membership
    const { data: memberships, error: membershipErr } = await supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", userId);

    if (membershipErr) throw membershipErr;

    if (!memberships || memberships.length === 0) {
      return res.json({ organization: null, locations: [] });
    }

    const orgId = memberships[0].organization_id;

    // Get organization
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();
    if (orgErr) throw orgErr;

    // Get locations for org
    const { data: locations, error: locErr } = await supabase
      .from("locations")
      .select("*")
      .eq("organization_id", orgId);
    if (locErr) throw locErr;

    return res.json({ organization: org, locations });
  } catch (err) {
    console.error("❌ Error in GET /organizations/mine:", err);
    return res.status(500).json({ error: "Failed to fetch organization data" });
  }
});

/**
 * POST /api/organizations
 * Create a new organization and add the user as owner
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, country = "US", timezone = "America/New_York" } = req.body;

    // Insert organization
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert([{ name, country, timezone, is_active: true }])
      .select()
      .single();
    if (orgErr) throw orgErr;

    // Link current user as owner
    await supabase.from("organization_members").insert([
      {
        organization_id: org.id,
        user_id: userId,
        role: "owner",
      },
    ]);

    return res.json({ organization: org });
  } catch (err) {
    console.error("❌ Error in POST /organizations:", err);
    return res.status(500).json({ error: "Failed to create organization" });
  }
});

/**
 * POST /api/organizations/:id/locations
 * Add a new location under an organization
 */
router.post("/:id/locations", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, manager } = req.body;

    const { data: location, error: locErr } = await supabase
      .from("locations")
      .insert([
        {
          organization_id: id,
          name,
          address,
          phone,
          manager,
          status: "active",
        },
      ])
      .select()
      .single();
    if (locErr) throw locErr;

    return res.json({ location });
  } catch (err) {
    console.error("❌ Error in POST /organizations/:id/locations:", err);
    return res.status(500).json({ error: "Failed to add location" });
  }
});

module.exports = router;
