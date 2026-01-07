import { useRef, useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function IPhoneModel({
  url = "/models/scandish.glb",
  onLoaded,
}) {
  const group = useRef(null);
  const screenMeshRef = useRef(null);
  const [hoveringScreen, setHoveringScreen] = useState(false);

  const { scene } = useGLTF(url);

  // --- CANVAS SCREEN (animated fake demo) ---
  const screen = useMemo(() => {
    const c = document.createElement("canvas");
    // keep it lighter for perf but still crisp
    c.width = 900;
    c.height = 1950;
    const ctx = c.getContext("2d");
    const tex = new THREE.CanvasTexture(c);
    tex.flipY = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return { c, ctx, tex };
  }, []);

  // Demo timeline (seconds)
  const timeline = useMemo(
    () => [
      { key: "menu", dur: 2.2 },
      { key: "edit", dur: 2.2 },
      { key: "sync", dur: 1.8 },
      { key: "live", dur: 2.0 },
    ],
    []
  );

  const total = useMemo(() => timeline.reduce((a, s) => a + s.dur, 0), [timeline]);

  // click-to-advance & pause logic
  const pauseUntilRef = useRef(0);
  const manualStepRef = useRef(null); // { key, t0 }

  const items = useMemo(
    () => [
      { name: "Margherita Pizza", price: 16.99 },
      { name: "Caesar Salad", price: 12.99 },
      { name: "Pasta Carbonara", price: 18.99 },
    ],
    []
  );

  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawPill(ctx, text, x, y, w, h, bg, fg) {
    ctx.save();
    ctx.fillStyle = bg;
    drawRoundedRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.font = "600 46px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2 + 2);
    ctx.restore();
  }

  function drawUI(stepKey, stepT) {
    const { ctx, c } = screen;
    const W = c.width;
    const H = c.height;

    // base
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0B0F0E";
    ctx.fillRect(0, 0, W, H);

    // top bar
    ctx.fillStyle = "#101614";
    ctx.fillRect(0, 0, W, 140);

    ctx.fillStyle = "#F3F5F4";
    ctx.font = "700 56px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("Demo Restaurant", 60, 70);

    // "Live" badge (only in live step)
    if (stepKey === "live") {
      drawPill(ctx, "Live", W - 180, 34, 120, 72, "rgba(30,122,74,0.95)", "#F3F5F4");
    } else {
      ctx.fillStyle = "rgba(166,176,170,0.5)";
      ctx.font = "500 34px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("Preview", W - 60, 78);
    }

    // list cards
    let y = 230;
    ctx.font = "700 34px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(166,176,170,0.75)";
    ctx.textAlign = "left";
    ctx.fillText("PIZZA", 60, y - 60);

    const editedPrice = 14.99; // fake changed value
    const priceFor = (i) => {
      if (stepKey === "live") return i === 0 ? editedPrice : items[i].price;
      if (stepKey === "edit") {
        // slider anim: ease between original->edited
        const a = items[i].price;
        const b = i === 0 ? editedPrice : items[i].price;
        const k = i === 0 ? Math.min(1, Math.max(0, stepT)) : 0;
        return a + (b - a) * (k * k * (3 - 2 * k));
      }
      return items[i].price;
    };

    for (let i = 0; i < items.length; i++) {
      ctx.save();
      const cardH = 150;
      const cardW = W - 120;
      const x = 60;

      // card bg
      ctx.fillStyle = "#101614";
      ctx.strokeStyle = "rgba(27,36,32,1)";
      ctx.lineWidth = 3;
      drawRoundedRect(ctx, x, y, cardW, cardH, 36);
      ctx.fill();
      ctx.stroke();

      // text
      ctx.fillStyle = "#F3F5F4";
      ctx.font = "650 44px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(items[i].name, x + 40, y + cardH / 2);

      ctx.fillStyle = "#1E7A4A";
      ctx.font = "750 44px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      const p = priceFor(i);
      ctx.fillText(`$${p.toFixed(2)}`, x + cardW - 40, y + cardH / 2);

      ctx.restore();
      y += 180;
    }

    // primary action
    const btnY = y + 40;

    if (stepKey === "menu") {
      drawPill(ctx, "Edit menu (demo)", 60, btnY, W - 120, 140, "rgba(30,122,74,1)", "#F3F5F4");
      ctx.fillStyle = "rgba(166,176,170,0.8)";
      ctx.font = "500 32px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`"Update in seconds" → try it.`, W / 2, btnY + 200);
    }

    if (stepKey === "edit") {
      drawPill(ctx, "Save & publish", 60, btnY, W - 120, 140, "rgba(30,122,74,1)", "#F3F5F4");

      // slider
      const sx = 90;
      const sy = btnY - 220;
      const sw = W - 180;
      const sh = 18;
      ctx.fillStyle = "rgba(166,176,170,0.25)";
      drawRoundedRect(ctx, sx, sy, sw, sh, 12);
      ctx.fill();

      // knob
      const k = Math.min(1, Math.max(0, stepT));
      const knobX = sx + sw * k;
      ctx.fillStyle = "#1E7A4A";
      drawRoundedRect(ctx, sx, sy, sw * k, sh, 12);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(knobX, sy + sh / 2, 22, 0, Math.PI * 2);
      ctx.fillStyle = "#F3F5F4";
      ctx.fill();

      ctx.fillStyle = "rgba(166,176,170,0.8)";
      ctx.font = "500 34px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Price slider", sx, sy - 30);
    }

    if (stepKey === "sync") {
      drawPill(ctx, "Syncing…", 60, btnY, W - 120, 140, "rgba(16,22,20,1)", "#F3F5F4");
      // progress bar
      const px = 90;
      const py = btnY - 210;
      const pw = W - 180;
      const ph = 18;
      ctx.fillStyle = "rgba(166,176,170,0.22)";
      drawRoundedRect(ctx, px, py, pw, ph, 12);
      ctx.fill();

      const prog = Math.min(1, Math.max(0, stepT));
      ctx.fillStyle = "rgba(30,122,74,0.95)";
      drawRoundedRect(ctx, px, py, pw * prog, ph, 12);
      ctx.fill();

      ctx.fillStyle = "rgba(166,176,170,0.8)";
      ctx.font = "500 34px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Publishing changes…", W / 2, py - 30);
    }

    if (stepKey === "live") {
      drawPill(ctx, "Replay demo", 60, btnY, W - 120, 140, "rgba(16,22,20,1)", "#F3F5F4");
      // toast
      const tx = 60;
      const ty = btnY - 240;
      const tw = W - 120;
      const th = 110;
      ctx.fillStyle = "rgba(30,122,74,0.18)";
      ctx.strokeStyle = "rgba(30,122,74,0.35)";
      ctx.lineWidth = 3;
      drawRoundedRect(ctx, tx, ty, tw, th, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#F3F5F4";
      ctx.font = "650 40px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Menu updated.", tx + 32, ty + 58);

      ctx.fillStyle = "rgba(166,176,170,0.9)";
      ctx.font = "500 34px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("QR unchanged", tx + tw - 32, ty + 58);
    }

    // hover affordance
    if (hoveringScreen) {
      ctx.save();
      ctx.strokeStyle = "rgba(30,122,74,0.9)";
      ctx.lineWidth = 10;
      drawRoundedRect(ctx, 26, 26, W - 52, H - 52, 60);
      ctx.stroke();
      drawPill(ctx, "Click to advance →", W - 440, 160, 380, 90, "rgba(16,22,20,0.92)", "#F3F5F4");
      ctx.restore();
    }

    screen.tex.needsUpdate = true;
  }

  function getStepByTime(t) {
    // manual override
    if (manualStepRef.current) {
      return manualStepRef.current;
    }

    const lt = t % total;
    let acc = 0;
    for (const s of timeline) {
      if (lt >= acc && lt < acc + s.dur) {
        return { key: s.key, t: (lt - acc) / s.dur };
      }
      acc += s.dur;
    }
    return { key: "menu", t: 0 };
  }

  // Find screen mesh once and replace its material with MeshBasicMaterial
  useEffect(() => {
    if (!scene) return;

    console.log("📱 iPhoneModel mounted, finding screen mesh…");

    let found = null;
    scene.traverse((obj) => {
      if (!obj?.isMesh) return;
      const matName = obj.material?.name?.toLowerCase?.() ?? "";
      const name = (obj.name ?? "").toLowerCase();

      // Your model: Object_55 material "Display"
      if (matName.includes("display") || name.includes("screen") || name.includes("display")) {
        found = obj;
      }
    });

    if (!found) {
      const names = [];
      scene.traverse((o) => {
        if (o.isMesh) names.push({ name: o.name, mat: o.material?.name });
      });
      console.warn("⚠️ Screen mesh not found. Mesh table:");
      console.table(names);
      return;
    }

    screenMeshRef.current = found;
    console.log("✅ Using screen mesh:", found.name, "| material:", found.material?.name);

    // Hard override to guarantee visibility
    found.material = new THREE.MeshBasicMaterial({
      map: screen.tex,
      toneMapped: false,
    });
    found.material.needsUpdate = true;

    // nicer shadows on rest
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    onLoaded?.();
  }, [scene, screen.tex, onLoaded]);

  // Cursor + hover
  useEffect(() => {
    document.body.style.cursor = hoveringScreen ? "pointer" : "";
    return () => (document.body.style.cursor = "");
  }, [hoveringScreen]);

  // Animate screen every frame
  useFrame((state) => {
    if (!group.current) return;

    // subtle float rotation
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.35) * 0.25;
    group.current.rotation.x = Math.sin(t * 0.22) * 0.05;

    // pause window after click
    const now = state.clock.getElapsedTime();
    if (now < pauseUntilRef.current) return;

    const step = getStepByTime(now);
    drawUI(step.key, step.t);
  });

  // Screen click handler: advance step instantly + pause auto-loop briefly
  const onPointerDown = (e) => {
    // Only if the clicked mesh is the screen OR inside it
    const hit = e.object;
    const screenMesh = screenMeshRef.current;
    if (!screenMesh) return;

    const isScreen =
      hit === screenMesh || hit?.uuid === screenMesh?.uuid || hit?.parent === screenMesh;

    if (!isScreen) return;

    e.stopPropagation();

    const now = e.clock?.getElapsedTime?.() ?? performance.now() / 1000;
    pauseUntilRef.current = now + 2.2;

    // advance manual step
    const current = manualStepRef.current ?? getStepByTime(now);
    const order = ["menu", "edit", "sync", "live"];
    const idx = Math.max(0, order.indexOf(current.key));
    const nextKey = order[(idx + 1) % order.length];
    manualStepRef.current = { key: nextKey, t: 0 };

    // clear manual override after pause
    setTimeout(() => {
      manualStepRef.current = null;
    }, 2200);
  };

  return (
    <group
      ref={group}
      position={[0.35, -0.15, 0]}
      rotation={[0.05, -0.55, 0.02]}
      scale={1.45}
      onPointerDown={onPointerDown}
      onPointerOver={(e) => {
        // hover only when hovering screen mesh
        if (!screenMeshRef.current) return;
        if (e.object === screenMeshRef.current) setHoveringScreen(true);
      }}
      onPointerOut={() => setHoveringScreen(false)}
    >
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.35}>
        <primitive object={scene} />
      </Float>
    </group>
  );
}

useGLTF.preload("/models/scandish.glb");
