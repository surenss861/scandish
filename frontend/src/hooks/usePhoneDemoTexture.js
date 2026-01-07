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
    let lastFrameTime = 0;
    const targetFPS = 30; // Cap to 30fps for performance
    const frameInterval = 1000 / targetFPS;
    let lastStep = null; // Track state changes

    const draw = (now) => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      // CRITICAL: Define W and H FIRST before any code that references them
      const W = canvas.width;
      const H = canvas.height;

      // Throttle to 30fps for performance (3M pixels is heavy)
      const deltaTime = now - lastFrameTime;
      if (deltaTime < frameInterval) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastFrameTime = now;

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

      // Only update texture if state changed or progress changed significantly
      const stateChanged = step !== lastStep?.step;
      const progressChanged = Math.floor(local * 10) !== Math.floor((lastStep?.local ?? 0) * 10);
      const shouldRedraw = stateChanged || progressChanged || step === "edit" || step === "sync";

      if (!shouldRedraw && !stateChanged) {
        raf = requestAnimationFrame(draw);
        return;
      }

      lastStep = { step, local };

      // Debug: log first draw (W and H are already defined at top of function)
      if (t < 0.1) {
        console.log("🎬 First frame drawing:", { step, W, H });
      }

      // Background - ALWAYS fill entire screen with solid background (critical for visibility)
      // W and H are already defined at the top of draw()
      
      // Clear and fill with bright background
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#1A211E"; // Even brighter background for visibility
      ctx.fillRect(0, 0, W, H);

      // Test: Draw a bright test pattern first to verify canvas is working
      if (t < 0.5) {
        // First 0.5s: show bright test pattern
        ctx.fillStyle = "#1E7A4A";
        ctx.fillRect(W * 0.1, H * 0.1, W * 0.8, H * 0.8);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 120px Inter, system-ui";
        ctx.textAlign = "center";
        ctx.fillText("DEMO", W / 2, H / 2);
        ctx.textAlign = "left";
        texture.needsUpdate = true;
        raf = requestAnimationFrame(draw);
        return;
      }

      // Subtle vignette - center is brightest (perception hack)
      const gradient = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.12)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);

      // Top bar - ALWAYS ON bright element (status bar) - perception hack
      ctx.fillStyle = "#252D2A"; // Brighter status bar
      ctx.fillRect(0, 0, W, 220); // Full width top bar
      roundRect(ctx, 80, 130, W - 160, 180, 40);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF"; // Pure white for max contrast
      ctx.font = "900 64px Inter, system-ui"; // Bolder, bigger
      ctx.fillText("Demo Restaurant", 130, 245);

      // Always-on "Live" indicator (subtle when not live)
      if (step === "live") {
        ctx.fillStyle = "#1E7A4A";
        roundRect(ctx, W - 200, 140, 160, 70, 35);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 42px Inter, system-ui";
        ctx.textAlign = "center";
        ctx.fillText("LIVE", W - 120, 180);
        ctx.textAlign = "left";
      }

      // Hero row - ONE big price row (not multiple small items) for instant clarity
      // Safe area insets to prevent UV stretching issues
      const safeAreaTop = 280;
      const safeAreaBottom = 200;
      const safeAreaLeft = 100;
      const safeAreaRight = 100;

      // Single hero item - BIG and obvious
      const heroItem = {
        name: "Margherita Pizza",
        price: step === "live" ? "$14.99" : "$16.99",
        isChanged: step === "live"
      };

      const cardY = safeAreaTop;
      const cardH = 280; // Bigger single row
      const cardW = W - safeAreaLeft - safeAreaRight;

      // Card background - much brighter for hero visibility
      ctx.fillStyle = "#28302D";
      ctx.strokeStyle = heroItem.isChanged
        ? "rgba(30,122,74,1.0)" // Very strong highlight
        : "rgba(30,122,74,0.4)";
      ctx.lineWidth = heroItem.isChanged ? 6 : 4;
      roundRect(ctx, safeAreaLeft, cardY, cardW, cardH, 60);
      ctx.fill();
      ctx.stroke();

      // Flash highlight for changed price
      if (heroItem.isChanged) {
        ctx.fillStyle = "rgba(30,122,74,0.2)";
        roundRect(ctx, safeAreaLeft, cardY, cardW, cardH, 60);
        ctx.fill();
      }

      // Text - pure white, MUCH bigger for hero visibility
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 72px Inter, system-ui"; // Much bigger
      ctx.fillText(heroItem.name, safeAreaLeft + 50, cardY + cardH / 2 - 20);

      // Price - bright green, HUGE, flash on change
      ctx.fillStyle = heroItem.isChanged ? "#2AAE67" : "#1E7A4A";
      ctx.font = "900 80px Inter, system-ui"; // Huge
      ctx.textAlign = "right";
      ctx.fillText(heroItem.price, W - safeAreaRight - 50, cardY + cardH / 2 - 20);
      ctx.textAlign = "left";

      // Edit affordance - always visible pencil icon or slider hint
      if (step === "menu") {
        ctx.fillStyle = "rgba(30,122,74,0.6)";
        ctx.font = "700 48px Inter, system-ui";
        ctx.fillText("✏️ Edit", safeAreaLeft + 50, cardY + cardH + 60);
      }

      // Primary button - ALWAYS ON bright element (perception hack)
      const btnY = safeAreaTop + cardH + 100;
      ctx.fillStyle = "#1E7A4A";
      roundRect(ctx, safeAreaLeft, btnY, cardW, 200, 65); // Bigger button
      ctx.fill();

      ctx.fillStyle = "#FFFFFF"; // Pure white for max contrast
      ctx.font = "900 60px Inter, system-ui"; // Bigger, bolder
      ctx.textAlign = "center";
      ctx.fillText(step === "menu" ? "Edit price" : step === "live" ? "Updated ✓" : "Publishing...", W / 2, btnY + 120);
      ctx.textAlign = "left";

      // Edit step - BIG slider (obvious action)
      if (step === "edit") {
        const editY = btnY + 250;
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        roundRect(ctx, safeAreaLeft, editY, cardW, 300, 60);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 56px Inter, system-ui"; // Bigger
        ctx.fillText("Update price", safeAreaLeft + 50, editY + 100);

        // BIG slider track
        const sliderY = editY + 180;
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        roundRect(ctx, safeAreaLeft + 50, sliderY, cardW - 100, 32, 32); // Bigger track
        ctx.fill();

        // Slider value anim
        const p = 0.2 + 0.6 * local;
        ctx.fillStyle = "#1E7A4A";
        roundRect(ctx, safeAreaLeft + 50, sliderY, (cardW - 100) * p, 32, 32);
        ctx.fill();

        // Big knob
        ctx.beginPath();
        ctx.arc(safeAreaLeft + 50 + (cardW - 100) * p, sliderY + 16, 28, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
      }

      // Syncing step - GIANT progress bar (obvious action)
      if (step === "sync") {
        const syncY = btnY + 250;
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        roundRect(ctx, safeAreaLeft, syncY, cardW, 320, 60);
        ctx.fill();

        // Big "Updating..." text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 64px Inter, system-ui"; // Even bigger
        ctx.textAlign = "center";
        ctx.fillText("Updating…", W / 2, syncY + 120);
        ctx.textAlign = "left";

        // GIANT progress bar track
        const progressY = syncY + 200;
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        roundRect(ctx, safeAreaLeft + 50, progressY, cardW - 100, 40, 40); // Much bigger
        ctx.fill();

        // Progress bar fill - bright green, animated
        ctx.fillStyle = "#1E7A4A";
        roundRect(ctx, safeAreaLeft + 50, progressY, (cardW - 100) * local, 40, 40);
        ctx.fill();

        // Percentage text - BIG
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 52px Inter, system-ui"; // Bigger
        ctx.textAlign = "center";
        ctx.fillText(`${Math.round(local * 100)}%`, W / 2, progressY + 50);
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
        const badgeX = W - safeAreaRight - 240;
        const badgeY = 120;
        const badgeW = 220;
        const badgeH = 120;

        // Multiple glow layers for strong visibility
        ctx.shadowColor = "rgba(30,122,74,0.95)";
        ctx.shadowBlur = 50;
        ctx.fillStyle = "#1E7A4A";
        roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 60);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Badge itself - bright green
        ctx.fillStyle = "#1E7A4A";
        roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 60);
        ctx.fill();

        // Flash pulse effect (subtle)
        const pulse = Math.sin(local * Math.PI * 2) * 0.1 + 0.9;
        ctx.fillStyle = `rgba(255,255,255,${pulse * 0.35})`;
        roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 60);
        ctx.fill();

        // Text - pure white, bigger
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 58px Inter, system-ui"; // Bigger
        ctx.textAlign = "center";
        ctx.fillText("LIVE", badgeX + badgeW / 2, badgeY + 75);
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
