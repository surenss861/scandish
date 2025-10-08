// backend/src/routes/menus.js
const express = require("express");
const router = express.Router();

const { supabase } = require("../services/supabase");
const { requireAuth } = require("../middleware/auth"); // from earlier step

/** -------------------- tiny helpers -------------------- */
const isNonEmptyStr = (v) => typeof v === "string" && v.trim().length > 0;
const isPrice = (v) => typeof v === "number" && v >= 0 && Number.isFinite(v);

function validateMenuPayload(body, { partial = false } = {}) {
  const errors = [];

  if (!partial) {
    if (!isNonEmptyStr(body.slug)) errors.push("slug is required");
    if (!isNonEmptyStr(body.title)) errors.push("title is required");
  } else {
    if (body.slug && !isNonEmptyStr(body.slug)) errors.push("slug must be non-empty string");
    if (body.title && !isNonEmptyStr(body.title)) errors.push("title must be non-empty string");
  }

  if (body.items) {
    if (!Array.isArray(body.items)) errors.push("items must be an array");
    else {
      body.items.forEach((it, i) => {
        if (!isNonEmptyStr(it.name)) errors.push(`items[${i}].name is required`);
        if (it.price != null && !isPrice(it.price))
          errors.push(`items[${i}].price must be a number >= 0`);
        if (it.sort_order != null && typeof it.sort_order !== "number")
          errors.push(`items[${i}].sort_order must be a number`);
      });
    }
  }

  return errors;
}

/** -------------------- PUBLIC: GET by slug -------------------- */
/**
 * GET /api/menus/:slug
 * Public menu endpoint for QR scans.
 * - Returns 404 if not found
 * - Items are sorted by sort_order ASC, then name ASC
 * - Adds mild caching + ETag if updated_at exists
 */
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const { data: menu, error } = await supabase
      .from("menus")
      .select(
        `
        id, slug, title, updated_at, content, location_id,
        items:menu_items(
          id, name, description, price, category, emoji, image_url, image_path, sort_order
        )
      `
      )
      .eq("slug", slug)
      .single();

    if (error && error.code !== "PGRST116") throw error; // handle real errors
    if (!menu) return res.status(404).json({ error: "Menu not found" });

    // Handle location-based menus with content in JSONB field
    if (menu.content && menu.location_id) {
      const content = menu.content;

      // Extract menu items from the content
      let menuItems = [];

      // Try different possible structures in the content
      if (content.currentMenuItems && Array.isArray(content.currentMenuItems)) {
        menuItems = content.currentMenuItems;
      } else if (content.menuContent && content.menuContent.items && Array.isArray(content.menuContent.items)) {
        menuItems = content.menuContent.items;
      } else if (content.livePreviewState && content.livePreviewState.menuItems && Array.isArray(content.livePreviewState.menuItems)) {
        menuItems = content.livePreviewState.menuItems;
      }

      // Transform the items to match the expected format
      menu.items = menuItems.map((item, index) => ({
        id: item.id || index + 1,
        name: item.name || 'Menu Item',
        description: item.description || '',
        price: item.price || 0,
        category: item.category || 'Menu',
        emoji: item.emoji || '🍽️',
        image_url: item.image_url || null,
        image_path: item.image_path || null,
        sort_order: item.sort_order || index + 1
      }));
    }

    // Sort items (server-side safety)
    if (Array.isArray(menu.items)) {
      menu.items.sort((a, b) => {
        const soA = a.sort_order ?? 0;
        const soB = b.sort_order ?? 0;
        if (soA !== soB) return soA - soB;
        return (a.name || "").localeCompare(b.name || "");
      });
    }

    // Cache headers (short TTL; you can bump if desired)
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    if (menu.updated_at) {
      res.set("ETag", `W/"menu-${menu.id}-${new Date(menu.updated_at).getTime()}"`);
    }

    return res.json(menu);
  } catch (err) {
    console.error("[GET /api/menus/:slug]", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
});

/** -------------------- AUTH’D: list my menus -------------------- */
/**
 * GET /api/menus/mine
 * Requires auth; returns menus owned by the current user.
 */
router.get("/mine/list", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("menus")
      .select("id, slug, title, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return res.json({ menus: data || [] });
  } catch (err) {
    console.error("[GET /api/menus/mine]", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
});

/** -------------------- AUTH’D: create menu -------------------- */
/**
 * POST /api/menus
 * Body: { slug, title, items?[] }
 * Enforces unique slug per project (DB should also have a UNIQUE index on menus.slug).
 */
router.post("/", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { slug, title, items = [], location_id, content } = req.body || {};

  console.log('Menu creation request:', { userId, slug, title, location_id, hasContent: !!content });

  // For location-based menus, we don't need slug validation
  let errors = [];
  if (location_id) {
    // Location-based menu validation
    if (!title) errors.push("title is required for location-based menus");
  } else {
    // Regular menu validation
    errors = validateMenuPayload({ slug, title, items });
  }
  if (errors.length) return res.status(400).json({ error: errors.join(", ") });

  try {
    // Check user's current plan and menu limits
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", userId)
      .single();

    const userPlan = subscription?.plan || 'free';

    // Get current menu count
    const { count: menuCount, error: countError } = await supabase
      .from("menus")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) throw countError;

    // Check plan limits
    const planLimits = {
      free: 1,
      starter: 5,
      pro: -1 // unlimited
    };

    const itemLimits = {
      free: 3,
      starter: -1, // unlimited
      pro: -1 // unlimited
    };

    const maxMenus = planLimits[userPlan] || 1;
    const maxItems = itemLimits[userPlan] || -1;

    // Check menu count limit
    if (maxMenus !== -1 && menuCount >= maxMenus) {
      return res.status(403).json({
        error: `${userPlan === 'free' ? 'Free' : 'Starter'} plan limited to ${maxMenus} menu${maxMenus > 1 ? 's' : ''}. Upgrade to create more.`,
        code: 'PLAN_LIMIT_EXCEEDED',
        currentCount: menuCount,
        maxAllowed: maxMenus,
        userPlan
      });
    }

    // Check item count limit for free users
    if (maxItems !== -1 && items.length > maxItems) {
      return res.status(403).json({
        error: `Free plan limited to ${maxItems} menu items. Upgrade to add more items.`,
        code: 'ITEM_LIMIT_EXCEEDED',
        currentCount: items.length,
        maxAllowed: maxItems,
        userPlan
      });
    }

    let insertedMenus, menuError;

    // For location-based menus, verify location ownership
    if (location_id) {
      // Get user's organization
      const { data: member, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (memberError || !member) {
        return res.status(403).json({ error: 'User must be part of an organization' });
      }

      // Verify location belongs to user's organization
      const { data: location, error: locationError } = await supabase
        .from('locations')
        .select('organization_id')
        .eq('id', location_id)
        .single();

      if (locationError || !location || location.organization_id !== member.organization_id) {
        return res.status(403).json({ error: 'Location not found or access denied' });
      }

      // Generate slug from title for location-based menus
      const generatedSlug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-') + '-' + Date.now();

      // Insert location-based menu
      const result = await supabase
        .from("menus")
        .insert({
          user_id: userId,
          location_id: location_id,
          slug: generatedSlug,
          title,
          content: content || null
        })
        .select()
        .limit(1);

      insertedMenus = result.data;
      menuError = result.error;
    } else {
      // Check for existing slug (original logic)
      const { data: existing, error: existingErr } = await supabase
        .from("menus")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (existingErr) throw existingErr;
      if (existing) return res.status(409).json({ error: "Slug already in use" });

      // Insert menu (original logic)
      const result = await supabase
        .from("menus")
        .insert({ user_id: userId, slug, title })
        .select()
        .limit(1);

      insertedMenus = result.data;
      menuError = result.error;
    }

    if (menuError) throw menuError;
    const menu = insertedMenus?.[0];

    // Insert items if provided
    if (Array.isArray(items) && items.length > 0) {
      const payload = items.map((it, idx) => ({
        menu_id: menu.id,
        name: it.name,
        description: it.description || "",
        price: it.price ?? 0,
        category: it.category || "",
        emoji: it.emoji || "",
        image_url: it.image || null,
        image_path: it.imagePath || null,
        sort_order: typeof it.sort_order === "number" ? it.sort_order : idx,
      }));
      const { error: itemsError } = await supabase.from("menu_items").insert(payload);
      if (itemsError) throw itemsError;
    }

    return res.status(201).json(menu);
  } catch (err) {
    console.error("[POST /api/menus]", err);
    // Handle unique constraint from DB just in case
    if (String(err.message || "").toLowerCase().includes("duplicate")) {
      return res.status(409).json({ error: "Slug already in use" });
    }
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
});

/** -------------------- AUTH’D: update menu + items -------------------- */
/**
 * PUT /api/menus/:id
 * Body: { title?, items?[] }
 * - Verifies ownership before mutating
 * - Replaces items when "items" is sent (idempotent replace)
 */
router.put("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, items } = req.body || {};
  const userId = req.user.id;

  // Validate "items" if provided
  const errors = validateMenuPayload({ title, items }, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join(", ") });

  try {
    // Ownership check
    const { data: found, error: findErr } = await supabase
      .from("menus")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (findErr && findErr.code !== "PGRST116") throw findErr;
    if (!found) return res.status(404).json({ error: "Menu not found" });
    if (found.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

    // Update title if provided
    if (isNonEmptyStr(title)) {
      const { error: updateErr } = await supabase.from("menus").update({ title }).eq("id", id);
      if (updateErr) throw updateErr;
    }

    // Replace items if provided
    if (Array.isArray(items)) {
      const { error: delErr } = await supabase.from("menu_items").delete().eq("menu_id", id);
      if (delErr) throw delErr;

      if (items.length > 0) {
        const payload = items.map((it, idx) => ({
          menu_id: id,
          name: it.name,
          description: it.description || "",
          price: it.price ?? 0,
          category: it.category || "",
          emoji: it.emoji || "",
          image_url: it.image || null,
          image_path: it.imagePath || null,
          sort_order: typeof it.sort_order === "number" ? it.sort_order : idx,
        }));
        const { error: insErr } = await supabase.from("menu_items").insert(payload);
        if (insErr) throw insErr;
      }
    }

    return res.json({ id, title, items });
  } catch (err) {
    console.error("[PUT /api/menus/:id]", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
});

/** -------------------- AUTH'D: delete menu -------------------- */
/**
 * DELETE /api/menus/:id
 * Verifies ownership before deleting menu and all associated items
 */
router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Ownership check
    const { data: found, error: findErr } = await supabase
      .from("menus")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (findErr && findErr.code !== "PGRST116") throw findErr;
    if (!found) return res.status(404).json({ error: "Menu not found" });
    if (found.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

    // Delete menu (cascade will delete menu_items)
    const { error: deleteErr } = await supabase
      .from("menus")
      .delete()
      .eq("id", id);

    if (deleteErr) throw deleteErr;

    return res.json({ success: true, message: "Menu deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/menus/:id]", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
});

module.exports = router;
