// server/routes/qr.js
import express from "express";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const menuUrl = `${process.env.PUBLIC_APP_URL}/menu/${encodeURIComponent(slug)}`;

    // Create a high-res PNG buffer
    const pngBuffer = await QRCode.toBuffer(menuUrl, {
      type: "png",
      width: 1024,         // print-friendly
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#FFFFFFFF" }
    });

    // Save to Supabase Storage (bucket: "qr")
    const path = `qr/${slug}.png`;
    const { error: uploadErr } = await supabase.storage
      .from("qr")
      .upload(path, pngBuffer, { contentType: "image/png", upsert: true });

    if (uploadErr) throw uploadErr;

    // Get a public URL
    const { data: pub } = supabase.storage.from("qr").getPublicUrl(path);

    return res.json({ slug, url: pub.publicUrl, menuUrl });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate QR" });
  }
});

export default router;
