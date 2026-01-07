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

    // Helper functions
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

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

    function fillBg(ctx, W, H) {
      // Premium dark gradient
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0B1110");
      g.addColorStop(0.5, "#0A1411");
      g.addColorStop(1, "#07100E");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Soft green bloom
      const rg = ctx.createRadialGradient(W * 0.7, H * 0.25, H * 0.1, W * 0.7, H * 0.25, H * 0.8);
      rg.addColorStop(0, "rgba(30,122,74,0.18)");
      rg.addColorStop(1, "rgba(30,122,74,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);

      // Subtle vignette
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.95);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }

    function glassCard(ctx, x, y, w, h, r, fill = "rgba(255,255,255,0.06)", stroke = "rgba(255,255,255,0.08)") {
      ctx.save();
      // Shadow
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = fill;
      roundRect(ctx, x, y, w, h, r);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, w, h, r);
      ctx.stroke();
      ctx.restore();
    }

    function pill(ctx, x, y, w, h, r, fill, text, textColor = "#fff", font = "800 40px Inter, system-ui") {
      ctx.save();
      ctx.fillStyle = fill;
      roundRect(ctx, x, y, w, h, r);
      ctx.fill();
      ctx.fillStyle = textColor;
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x + w / 2, y + h / 2 + 1);
      ctx.restore();
    }

    function drawShimmerSweep(ctx, x, y, w, h, t, intensity = 0.22) {
      ctx.save();
      // Clip to card
      ctx.beginPath();
      roundRect(ctx, x, y, w, h, 70);
      ctx.clip();
      // Move a diagonal shimmer across
      const speed = 0.6; // slower = more premium
      const p = (t * speed) % 1;
      const sweepX = x + (p * (w + 260)) - 260;
      const g = ctx.createLinearGradient(sweepX, y, sweepX + 260, y + h);
      g.addColorStop(0.0, "rgba(255,255,255,0)");
      g.addColorStop(0.45, `rgba(255,255,255,${intensity})`);
      g.addColorStop(0.55, `rgba(255,255,255,${intensity})`);
      g.addColorStop(1.0, "rgba(255,255,255,0)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      ctx.restore();
    }

    function drawTextFieldWithCaret(ctx, x, y, w, h, valueText, t, focused = true, progress = 1) {
      // Field background
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.strokeStyle = focused ? "rgba(42,174,103,0.9)" : "rgba(255,255,255,0.12)";
      ctx.lineWidth = focused ? 3 : 2;
      roundRect(ctx, x, y, w, h, 40);
      ctx.fill();
      ctx.stroke();
      // Focus glow
      if (focused) {
        ctx.shadowColor = "rgba(42,174,103,0.55)";
        ctx.shadowBlur = 24;
        ctx.strokeStyle = "rgba(42,174,103,0.35)";
        roundRect(ctx, x - 1, y - 1, w + 2, h + 2, 42);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      // Text
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "900 56px Inter, system-ui";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(valueText, x + 42, y + h / 2);
      // Caret blink (only when focused)
      if (focused) {
        const blink = Math.floor(t * 2) % 2 === 0; // 2Hz blink
        if (blink) {
          // crude text width measure for caret placement
          const tw = ctx.measureText(valueText).width;
          const caretX = x + 42 + tw + 8;
          ctx.strokeStyle = "rgba(239,255,246,0.95)";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(caretX, y + 18);
          ctx.lineTo(caretX, y + h - 18);
          ctx.stroke();
        }
      }
      // Subtle "typing" highlight sweep when editing
      if (focused) {
        const glowP = Math.min(1, Math.max(0, progress));
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = `rgba(42,174,103,${0.08 + glowP * 0.06})`;
        roundRect(ctx, x, y, w, h, 40);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawMenuList(ctx, x, y, w, rowH, t, activeIndex = 0) {
      // Subtle continuous scroll illusion
      // Speed is tiny: looks alive without being distracting.
      const scrollSpeed = 22; // px/sec
      const offset = (t * scrollSpeed) % rowH;
      const items = [
        { name: "Margherita Pizza", price: "$16.99" },
        { name: "Truffle Fries", price: "$9.50" },
        { name: "Caesar Salad", price: "$11.00" },
        { name: "Spicy Rigatoni", price: "$18.75" },
        { name: "Tiramisu", price: "$8.00" },
      ];
      // container
      ctx.save();
      roundRect(ctx, x, y, w, rowH * 3.2, 60);
      ctx.clip();
      // draw 4 rows (enough to loop)
      for (let i = -1; i < 6; i++) {
        const idx = (i + items.length) % items.length;
        const yy = y + i * rowH - offset;
        const isActive = idx === activeIndex;
        const bg = isActive ? "rgba(42,174,103,0.10)" : "rgba(255,255,255,0.04)";
        const stroke = isActive ? "rgba(42,174,103,0.25)" : "rgba(255,255,255,0.06)";
        // row card
        ctx.fillStyle = bg;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        roundRect(ctx, x, yy, w, rowH - 18, 46);
        ctx.fill();
        ctx.stroke();
        // name
        ctx.fillStyle = "rgba(255,255,255,0.88)";
        ctx.font = "800 44px Inter, system-ui";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(items[idx].name, x + 44, yy + (rowH - 18) / 2);
        // price
        ctx.textAlign = "right";
        ctx.fillStyle = isActive ? "#2AAE67" : "rgba(255,255,255,0.55)";
        ctx.font = "900 44px Inter, system-ui";
        ctx.fillText(items[idx].price, x + w - 44, yy + (rowH - 18) / 2);
        ctx.textAlign = "left";
      }
      // top/bottom fade masks (premium)
      const fadeH = 80;
      const topFade = ctx.createLinearGradient(0, y, 0, y + fadeH);
      topFade.addColorStop(0, "rgba(0,0,0,0.55)");
      topFade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = topFade;
      ctx.fillRect(x, y, w, fadeH);
      const botFade = ctx.createLinearGradient(0, y + rowH * 3.2 - fadeH, 0, y + rowH * 3.2);
      botFade.addColorStop(0, "rgba(0,0,0,0)");
      botFade.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = botFade;
      ctx.fillRect(x, y + rowH * 3.2 - fadeH, w, fadeH);
      ctx.restore();
    }

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

      // --- PREMIUM UI DRAWING ---
      ctx.clearRect(0, 0, W, H);
      fillBg(ctx, W, H);

      // Safe frame (simulate phone UI margins)
      const padX = Math.round(W * 0.075);
      const padTop = Math.round(H * 0.09);
      const padBottom = Math.round(H * 0.08);

      // --- iOS status bar ---
      const sbY = Math.round(H * 0.045);
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "700 44px Inter, system-ui";
      ctx.textAlign = "left";
      ctx.fillText("9:41", padX, sbY);

      // wifi bars
      const wifiX = W - padX - 260;
      const barY = sbY - 26;
      for (let i = 0; i < 4; i++) {
        const bh = 12 + i * 10;
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        roundRect(ctx, wifiX + i * 18, barY + (48 - bh), 10, bh, 5);
        ctx.fill();
      }

      // battery
      const bx = W - padX - 110;
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 4;
      roundRect(ctx, bx, barY + 10, 86, 34, 10);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      roundRect(ctx, bx + 6, barY + 16, 62, 22, 8);
      ctx.fill();
      ctx.restore();

      // Header row
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "900 70px Inter, system-ui";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("Demo Restaurant", padX, padTop + 40);

      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "600 42px Inter, system-ui";
      ctx.fillText("Menu Editor", padX, padTop + 105);

      // --- Live toggle (premium affordance) ---
      const toggleX = W - padX - 260;
      const toggleY = padTop + 15;
      glassCard(ctx, toggleX, toggleY, 260, 86, 44, "rgba(255,255,255,0.06)", "rgba(255,255,255,0.10)");

      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "700 34px Inter, system-ui";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("Live", toggleX + 30, toggleY + 43);

      // switch
      const swX = toggleX + 150;
      const swY = toggleY + 24;
      const isLive = step === "live";
      ctx.fillStyle = isLive ? "rgba(30,122,74,0.95)" : "rgba(255,255,255,0.14)";
      roundRect(ctx, swX, swY, 84, 40, 22);
      ctx.fill();
      ctx.fillStyle = "#EFFFF6";
      ctx.beginPath();
      ctx.arc(swX + (isLive ? 62 : 22), swY + 20, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = "left";

      // Hero dish card with "photo" strip
      const cardX = padX;
      const cardY = padTop + 160;
      const cardW = W - padX * 2;
      const cardH = Math.round(H * 0.28);
      glassCard(ctx, cardX, cardY, cardW, cardH, 70);

      // photo strip
      ctx.save();
      const photoH = Math.round(cardH * 0.46);
      const pg = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + photoH);
      pg.addColorStop(0, "rgba(30,122,74,0.28)");
      pg.addColorStop(1, "rgba(255,255,255,0.06)");
      ctx.fillStyle = pg;
      roundRect(ctx, cardX + 18, cardY + 18, cardW - 36, photoH, 55);
      ctx.fill();
      ctx.restore();

      // Shimmer sweep on hero card (premium feel)
      if (step === "menu" || step === "live") {
        drawShimmerSweep(ctx, cardX, cardY, cardW, cardH, t, 0.18);
      }

      // dish title
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "900 62px Inter, system-ui";
      ctx.fillText("Margherita Pizza", cardX + 52, cardY + photoH + 85);

      // subtitle
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "600 40px Inter, system-ui";
      ctx.fillText("Edit price → publish instantly", cardX + 52, cardY + photoH + 145);

      // price
      const price = step === "live" ? "$14.99" : "$16.99";
      ctx.textAlign = "right";
      ctx.fillStyle = step === "live" ? "#2AAE67" : "rgba(255,255,255,0.8)";
      ctx.font = "900 74px Inter, system-ui";
      ctx.fillText(price, cardX + cardW - 52, cardY + photoH + 105);
      ctx.textAlign = "left";

      // Primary CTA button
      const btnY = cardY + cardH + 90;
      glassCard(ctx, cardX, btnY, cardW, 190, 65, "rgba(30,122,74,0.18)", "rgba(30,122,74,0.35)");
      ctx.fillStyle = "#EFFFF6";
      ctx.font = "900 62px Inter, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let btnLabel = "Edit price";
      if (step === "edit") btnLabel = "Editing…";
      if (step === "sync") btnLabel = "Publishing…";
      if (step === "live") btnLabel = "Updated ✓";
      ctx.fillText(btnLabel, W / 2, btnY + 95);

      // Mini menu list section (alive + real)
      const listY = btnY + 220;
      const listH = Math.round(H * 0.28);
      glassCard(ctx, cardX, listY, cardW, listH, 70, "rgba(255,255,255,0.055)", "rgba(255,255,255,0.08)");
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "800 42px Inter, system-ui";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("Today's menu", cardX + 52, listY + 78);
      // Scroll list rows
      drawMenuList(ctx, cardX + 28, listY + 110, cardW - 56, 130, t, 0);

      // Edit / Sync overlays (looks like a real sheet)
      if (step === "edit" || step === "sync") {
        const sheetH = Math.round(H * 0.30);
        const sheetY = H - padBottom - sheetH;
        glassCard(ctx, padX, sheetY, W - padX * 2, sheetH, 70, "rgba(255,255,255,0.08)", "rgba(255,255,255,0.09)");
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "900 56px Inter, system-ui";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(step === "edit" ? "Update price" : "Publishing update", padX + 60, sheetY + 95);

        if (step === "edit") {
          // Real price input field with focus ring + caret
          const fieldX = padX + 60;
          const fieldY = sheetY + 150;
          const fieldW = W - padX * 2 - 120;
          const fieldH = 120;
          // Animate typed value (looks like input)
          const from = "$16.99";
          const to = "$14.99";
          const typed = local < 0.5 ? from : to; // quick snap reads better in hero
          drawTextFieldWithCaret(ctx, fieldX, fieldY, fieldW, fieldH, typed, t, true, local);
          // Helper text
          ctx.fillStyle = "rgba(255,255,255,0.55)";
          ctx.font = "700 38px Inter, system-ui";
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
          ctx.fillText("Price", fieldX, fieldY + fieldH + 70);
          ctx.textAlign = "right";
          ctx.fillStyle = "rgba(42,174,103,0.95)";
          ctx.font = "900 42px Inter, system-ui";
          ctx.fillText("Tap publish", fieldX + fieldW, fieldY + fieldH + 70);
          ctx.textAlign = "left";
        }

        if (step === "sync") {
          // progress
          const pX = padX + 60;
          const pY = sheetY + 160;
          const pW = W - padX * 2 - 120;
          const pH = 40;
          ctx.fillStyle = "rgba(255,255,255,0.22)";
          roundRect(ctx, pX, pY, pW, pH, 24);
          ctx.fill();
          ctx.fillStyle = "#1E7A4A";
          roundRect(ctx, pX, pY, pW * local, pH, 24);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.font = "800 44px Inter, system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${Math.round(local * 100)}%`, W / 2, pY + pH / 2);
          ctx.textAlign = "left";
        }
      }

      // Live toast
      if (step === "live") {
        const toastW = Math.round(W * 0.82);
        const toastH = 165;
        const toastX = (W - toastW) / 2;
        const toastY = Math.round(H * 0.62);
        ctx.save();
        ctx.shadowColor = "rgba(30,122,74,0.35)";
        ctx.shadowBlur = 40;
        glassCard(ctx, toastX, toastY, toastW, toastH, 65, "rgba(30,122,74,0.16)", "rgba(30,122,74,0.26)");
        ctx.restore();
        ctx.fillStyle = "#EFFFF6";
        ctx.font = "900 52px Inter, system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Live in seconds ✓  QR unchanged", W / 2, toastY + toastH / 2);
      }

      // ✅ update texture
      texture.needsUpdate = true;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [canvas, texture]);

  return texture;
}
