import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export function usePhoneDemoTexture() {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    // iPhone 17 Pro screen resolution (approximate)
    // Standard iPhone aspect ratio: ~9:19.5 (390x844 points, but we need higher res for crisp display)
    // Using a resolution that matches iPhone screen density
    c.width = 1170;  // 390 * 3 (3x retina)
    c.height = 2532; // 844 * 3 (matches iPhone 17 Pro resolution)
    return c;
  }, []);

  const ctxRef = useRef(null);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace; // Critical: sRGB for proper whites
    t.anisotropy = 8;
    t.flipY = false;
    t.generateMipmaps = false; // No mipmaps for crisp text
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
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

      // timeline loop - start on bright "menu" state, make demo obvious in <1s
      const steps = [
        { name: "menu", dur: 4.0 }, // Long menu state - this is the "hero frame"
        { name: "edit", dur: 1.5 }, // Quick edit moment
        { name: "sync", dur: 1.2 }, // Quick syncing
        { name: "live", dur: 3.0 }, // Long live state - obvious result
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

      // Background - ALWAYS fill entire screen with solid background (critical for visibility)
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      // Solid bright background - fills entire canvas (brighter for hero visibility)
      ctx.fillStyle = "#161C1A"; // Brighter background so it reads as "OLED on" from distance
      ctx.fillRect(0, 0, W, H);

      // Top bar - much brighter, fills full width
      ctx.fillStyle = "#1F2522";
      ctx.fillRect(0, 0, W, 200); // Full width top bar
      roundRect(ctx, 70, 120, W - 140, 170, 36);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF"; // Pure white for max contrast
      ctx.font = "800 60px Inter, system-ui";
      ctx.fillText("Demo Restaurant", 120, 235);

      // Menu cards - 3 big items, MAXIMUM contrast, reads in 0.5s
      // Scale everything proportionally to canvas size
      const items = [
        ["Margherita Pizza", step === "live" ? "$14.99" : "$16.99"], // OBVIOUS price change
        ["Caesar Salad", "$12.99"],
        ["Pasta Carbonara", step === "live" ? "$19.99" : "$18.99"], // OBVIOUS price change
      ];
      let y = 400;
      for (let i = 0; i < items.length; i++) {
        const [name, price] = items[i];
        const isChanged = step === "live" && (price.includes("14.99") || price.includes("19.99"));
        
        // Card background - brighter cards for hero visibility
        ctx.fillStyle = "#222A28";
        ctx.strokeStyle = isChanged 
          ? "rgba(30,122,74,0.8)" // Strong highlight for changed prices
          : "rgba(30,122,74,0.3)";
        ctx.lineWidth = isChanged ? 5 : 3;
        roundRect(ctx, 80, y, W - 160, 200, 52); // Bigger cards
        ctx.fill();
        ctx.stroke();
        
        // Flash highlight for changed prices
        if (isChanged) {
          ctx.fillStyle = "rgba(30,122,74,0.15)";
          roundRect(ctx, 80, y, W - 160, 200, 52);
          ctx.fill();
        }

        // Text - pure white, bigger for hero visibility
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 58px Inter, system-ui"; // Bigger
        ctx.fillText(name, 120, y + 120);

        // Price - bright green, even larger, flash on change
        ctx.fillStyle = isChanged ? "#2AAE67" : "#1E7A4A"; // Brighter green when changed
        ctx.font = "900 62px Inter, system-ui"; // Even bigger
        ctx.fillText(price, W - 280, y + 120);

        y += 240; // More spacing
      }

      // Primary button - bright green
      ctx.fillStyle = "#1E7A4A";
      roundRect(ctx, 120, 1120, W - 240, 180, 60);
      ctx.fill();

      ctx.fillStyle = "#F3F5F4"; // Bright white text
      ctx.font = "800 54px Inter, system-ui";
      ctx.fillText(step === "menu" ? "Edit menu (demo)" : "Publish changes", 180, 1235);

      // Edit step slider
      if (step === "edit") {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        roundRect(ctx, 120, 1380, W - 240, 260, 54);
        ctx.fill();

        ctx.fillStyle = "#F3F5F4";
        ctx.font = "700 48px Inter, system-ui";
        ctx.fillText("Update price", 180, 1470);

        // Slider track
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        roundRect(ctx, 180, 1535, W - 360, 20, 20);
        ctx.fill();

        // Slider value anim
        const p = 0.2 + 0.6 * local;
        ctx.fillStyle = "#1E7A4A";
        roundRect(ctx, 180, 1535, (W - 360) * p, 20, 20);
        ctx.fill();

        // Knob
        ctx.beginPath();
        ctx.arc(180 + (W - 360) * p, 1545, 24, 0, Math.PI * 2);
        ctx.fillStyle = "#F3F5F4";
        ctx.fill();
      }

      // Syncing step with BIG progress bar (obvious action)
      if (step === "sync") {
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        roundRect(ctx, 100, 1400, W - 200, 280, 60);
        ctx.fill();

        // Big "Updating..." text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 56px Inter, system-ui";
        ctx.fillText("Updating…", 150, 1500);

        // BIG progress bar track
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        roundRect(ctx, 150, 1580, W - 300, 28, 28); // Bigger, more visible
        ctx.fill();

        // Progress bar fill - bright green, animated
        ctx.fillStyle = "#1E7A4A";
        roundRect(ctx, 150, 1580, (W - 300) * local, 28, 28);
        ctx.fill();
        
        // Percentage text
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "700 42px Inter, system-ui";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.round(local * 100)}%`, W / 2, 1600);
        ctx.textAlign = "left";
      }

      // Live step toast + "Live" badge
      if (step === "live") {
        // Toast
        ctx.fillStyle = "rgba(30,122,74,0.25)";
        roundRect(ctx, 120, 1400, W - 240, 190, 54);
        ctx.fill();

        ctx.fillStyle = "#F3F5F4";
        ctx.font = "800 46px Inter, system-ui";
        ctx.fillText("Live in seconds ✓", 180, 1510);

        // "Live" badge - EXTREMELY OBVIOUS, bigger, glowing with flash
        const badgeX = W - 280;
        const badgeY = 110;
        const badgeW = 210;
        const badgeH = 110;
        
        // Multiple glow layers for strong visibility
        ctx.shadowColor = "rgba(30,122,74,0.9)";
        ctx.shadowBlur = 40;
        ctx.fillStyle = "#1E7A4A";
        roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 55);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Badge itself - bright green
        ctx.fillStyle = "#1E7A4A";
        roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 55);
        ctx.fill();
        
        // Flash pulse effect (subtle)
        const pulse = Math.sin(local * Math.PI * 2) * 0.1 + 0.9;
        ctx.fillStyle = `rgba(255,255,255,${pulse * 0.3})`;
        roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 55);
        ctx.fill();

        // Text - pure white, bigger
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 54px Inter, system-ui";
        ctx.textAlign = "center";
        ctx.fillText("LIVE", W - 175, 175);
        ctx.textAlign = "left";
      } else {
        // "Preview" badge when not live
        ctx.fillStyle = "rgba(166,176,170,0.3)";
        roundRect(ctx, W - 220, 140, 150, 80, 40);
        ctx.fill();

        ctx.fillStyle = "rgba(166,176,170,0.8)";
        ctx.font = "600 38px Inter, system-ui";
        ctx.textAlign = "center";
        ctx.fillText("Preview", W - 145, 185);
        ctx.textAlign = "left";
      }

      // "QR unchanged" badge
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      roundRect(ctx, W - 360, H - 190, 260, 90, 45);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "700 34px Inter, system-ui";
      ctx.textAlign = "right";
      ctx.fillText("QR unchanged", W - 330, H - 130);
      ctx.textAlign = "left";

      // Screen edge emissive illusion - always visible, stronger when live
      ctx.save();
      const glowIntensity = step === "live" ? 0.35 : 0.1; // Stronger glow when live
      ctx.strokeStyle = `rgba(30,122,74,${glowIntensity})`;
      ctx.lineWidth = step === "live" ? 16 : 8;
      roundRect(ctx, 25, 95, W - 50, H - 190, 50);
      ctx.stroke();
      
      // Inner glow (softer)
      ctx.strokeStyle = `rgba(30,122,74,${glowIntensity * 0.5})`;
      ctx.lineWidth = 6;
      roundRect(ctx, 35, 105, W - 70, H - 210, 45);
      ctx.stroke();
      ctx.restore();

      // CRITICAL: Mark texture as dirty EVERY frame for smooth animation
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
