import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export function usePhoneDemoTexture() {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 900;
    c.height = 1950;
    return c;
  }, []);

  const ctxRef = useRef(null);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.flipY = false;
    return t;
  }, [canvas]);

  useEffect(() => {
    ctxRef.current = canvas.getContext("2d");
    let raf = 0;
    const start = performance.now();

    const draw = (now) => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      const t = (now - start) / 1000;

      // timeline loop
      const steps = [
        { name: "menu", dur: 2.2 },
        { name: "edit", dur: 2.2 },
        { name: "sync", dur: 1.8 },
        { name: "live", dur: 2.0 },
      ];
      const total = steps.reduce((a, s) => a + s.dur, 0);
      let tt = t % total;

      let step = steps[0].name;
      let local = 0;
      for (const s of steps) {
        if (tt <= s.dur) {
          step = s.name;
          local = tt / s.dur;
          break;
        }
        tt -= s.dur;
      }

      // Background - darker for OLED contrast
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0B0F0E";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top bar - brighter
      ctx.fillStyle = "#101614";
      roundRect(ctx, 70, 120, canvas.width - 140, 170, 36);
      ctx.fill();

      ctx.fillStyle = "#F3F5F4"; // Bright white
      ctx.font = "700 56px Inter, system-ui";
      ctx.fillText("Demo Restaurant", 120, 230);

      // Menu cards with high contrast
      const items = [
        ["Margherita Pizza", step === "live" ? "$14.99" : "$16.99"], // Price changes!
        ["Caesar Salad", "$12.99"],
        ["Pasta Carbonara", step === "live" ? "$19.99" : "$18.99"], // Price changes!
      ];
      let y = 380;
      for (const [name, price] of items) {
        // Card background - brighter
        ctx.fillStyle = "#101614";
        roundRect(ctx, 90, y, canvas.width - 180, 170, 44);
        ctx.fill();

        // Text - bright white
        ctx.fillStyle = "#F3F5F4";
        ctx.font = "600 46px Inter, system-ui";
        ctx.fillText(name, 140, y + 110);

        // Price - bright green
        ctx.fillStyle = "#1E7A4A";
        ctx.font = "800 46px Inter, system-ui";
        ctx.fillText(price, canvas.width - 300, y + 110);

        y += 210;
      }

      // Primary button - bright green
      ctx.fillStyle = "#1E7A4A";
      roundRect(ctx, 120, 1120, canvas.width - 240, 180, 60);
      ctx.fill();

      ctx.fillStyle = "#F3F5F4"; // Bright white text
      ctx.font = "800 54px Inter, system-ui";
      ctx.fillText(step === "menu" ? "Edit menu (demo)" : "Publish changes", 180, 1235);

      // Edit step slider
      if (step === "edit") {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        roundRect(ctx, 120, 1380, canvas.width - 240, 260, 54);
        ctx.fill();

        ctx.fillStyle = "#F3F5F4";
        ctx.font = "700 48px Inter, system-ui";
        ctx.fillText("Update price", 180, 1470);

        // Slider track
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        roundRect(ctx, 180, 1535, canvas.width - 360, 20, 20);
        ctx.fill();

        // Slider value anim
        const p = 0.2 + 0.6 * local;
        ctx.fillStyle = "#1E7A4A";
        roundRect(ctx, 180, 1535, (canvas.width - 360) * p, 20, 20);
        ctx.fill();

        // Knob
        ctx.beginPath();
        ctx.arc(180 + (canvas.width - 360) * p, 1545, 24, 0, Math.PI * 2);
        ctx.fillStyle = "#F3F5F4";
        ctx.fill();
      }

      // Syncing step with progress bar
      if (step === "sync") {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        roundRect(ctx, 120, 1380, canvas.width - 240, 220, 54);
        ctx.fill();

        ctx.fillStyle = "#F3F5F4";
        ctx.font = "700 48px Inter, system-ui";
        ctx.fillText("Syncing…", 180, 1470);

        // Progress bar track
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        roundRect(ctx, 180, 1520, canvas.width - 360, 18, 18);
        ctx.fill();

        // Progress bar fill - bright green
        ctx.fillStyle = "#1E7A4A";
        roundRect(ctx, 180, 1520, (canvas.width - 360) * local, 18, 18);
        ctx.fill();
      }

      // Live step toast + "Live" badge
      if (step === "live") {
        // Toast
        ctx.fillStyle = "rgba(30,122,74,0.25)";
        roundRect(ctx, 120, 1400, canvas.width - 240, 190, 54);
        ctx.fill();

        ctx.fillStyle = "#F3F5F4";
        ctx.font = "800 46px Inter, system-ui";
        ctx.fillText("Live in seconds ✓", 180, 1510);

        // "Live" badge in top right - OBVIOUS
        ctx.fillStyle = "#1E7A4A";
        roundRect(ctx, canvas.width - 220, 140, 150, 80, 40);
        ctx.fill();

        ctx.fillStyle = "#F3F5F4";
        ctx.font = "800 42px Inter, system-ui";
        ctx.textAlign = "center";
        ctx.fillText("LIVE", canvas.width - 145, 185);
        ctx.textAlign = "left";
      } else {
        // "Preview" badge when not live
        ctx.fillStyle = "rgba(166,176,170,0.3)";
        roundRect(ctx, canvas.width - 220, 140, 150, 80, 40);
        ctx.fill();

        ctx.fillStyle = "rgba(166,176,170,0.8)";
        ctx.font = "600 38px Inter, system-ui";
        ctx.textAlign = "center";
        ctx.fillText("Preview", canvas.width - 145, 185);
        ctx.textAlign = "left";
      }

      // "QR unchanged" badge
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      roundRect(ctx, canvas.width - 360, canvas.height - 190, 260, 90, 45);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "700 34px Inter, system-ui";
      ctx.textAlign = "right";
      ctx.fillText("QR unchanged", canvas.width - 330, canvas.height - 130);
      ctx.textAlign = "left";

      // Subtle screen glow effect (halo around screen edge)
      if (step === "live") {
        ctx.save();
        ctx.strokeStyle = "rgba(30,122,74,0.15)";
        ctx.lineWidth = 8;
        roundRect(ctx, 30, 100, canvas.width - 60, canvas.height - 200, 50);
        ctx.stroke();
        ctx.restore();
      }

      texture.needsUpdate = true;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [canvas, texture]);

  return texture;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
