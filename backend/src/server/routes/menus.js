// backend/src/routes/menus.js
import { Router } from "express";
const router = Router();

// Minimal example — replace with your real persistence
router.post("/", async (req, res) => {
  try {
    const { user_id, slug, title, items } = req.body || {};
    if (!slug) return res.status(400).json({ error: "Missing slug" });
    // TODO: save to DB here
    return res.status(200).json({ ok: true, slug, title, count: (items || []).length });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Save failed" });
  }
});

export default router;
