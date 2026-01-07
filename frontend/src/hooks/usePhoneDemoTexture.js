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

      // background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0B0F0E";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // top bar
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      roundRect(ctx, 70, 120, canvas.width - 140, 170, 36);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.font = "700 56px Inter, system-ui";
      ctx.fillText("Demo Restaurant", 120, 230);

      // menu cards
      const items = [
        ["Margherita Pizza", "$16.99"],
        ["Caesar Salad", "$12.99"],
        ["Pasta Carbonara", step === "live" ? "$19.99" : "$18.99"],
      ];
      let y = 380;
      for (const [name, price] of items) {
        ctx.fillStyle = "rgba(255,255,255,0.055)";
        roundRect(ctx, 90, y, canvas.width - 180, 170, 44);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.86)";
        ctx.font = "600 46px Inter, system-ui";
        ctx.fillText(name, 140, y + 110);

        ctx.fillStyle = "#16a34a";
        ctx.font = "800 46px Inter, system-ui";
        ctx.fillText(price, canvas.width - 300, y + 110);

        y += 210;
      }

      // primary button
      ctx.fillStyle = "#16a34a";
      roundRect(ctx, 120, 1120, canvas.width - 240, 180, 60);
      ctx.fill();

      ctx.fillStyle = "#07210f";
      ctx.font = "800 54px Inter, system-ui";
      ctx.fillText(step === "menu" ? "Edit menu (demo)" : "Publish changes", 180, 1235);

      // edit step slider
      if (step === "edit") {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        roundRect(ctx, 120, 1380, canvas.width - 240, 260, 54);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "700 48px Inter, system-ui";
        ctx.fillText("Update price", 180, 1470);

        // slider track
        ctx.fillStyle = "rgba(255,255,255,0.14)";
        roundRect(ctx, 180, 1535, canvas.width - 360, 20, 20);
        ctx.fill();

        // slider value anim
        const p = 0.2 + 0.6 * local;
        ctx.fillStyle = "#16a34a";
        roundRect(ctx, 180, 1535, (canvas.width - 360) * p, 20, 20);
        ctx.fill();

        // knob
        ctx.beginPath();
        ctx.arc(180 + (canvas.width - 360) * p, 1545, 24, 0, Math.PI * 2);
        ctx.fillStyle = "#eafff0";
        ctx.fill();
      }

      // syncing step
      if (step === "sync") {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        roundRect(ctx, 120, 1380, canvas.width - 240, 220, 54);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "700 48px Inter, system-ui";
        ctx.fillText("Syncing…", 180, 1470);

        ctx.fillStyle = "rgba(255,255,255,0.14)";
        roundRect(ctx, 180, 1520, canvas.width - 360, 18, 18);
        ctx.fill();

        ctx.fillStyle = "#16a34a";
        roundRect(ctx, 180, 1520, (canvas.width - 360) * local, 18, 18);
        ctx.fill();
      }

      // live step toast + badge
      if (step === "live") {
        ctx.fillStyle = "rgba(22,163,74,0.16)";
        roundRect(ctx, 120, 1400, canvas.width - 240, 190, 54);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.font = "800 46px Inter, system-ui";
        ctx.fillText("Live in seconds ✓", 180, 1510);
      }

      // "QR unchanged" badge
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      roundRect(ctx, canvas.width - 360, canvas.height - 190, 260, 90, 45);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "700 34px Inter, system-ui";
      ctx.fillText("QR unchanged", canvas.width - 330, canvas.height - 130);

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

