import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export default function IPhoneModel({ url = "/models/scandish.glb", onLoaded }) {
  const group = useRef(null);
  const screenMeshRef = useRef(null);
  const hovered = useRef(false);
  const clickedAt = useRef(0);

  console.log("🔵 IPhoneModel component rendering, loading:", url);

  const { scene } = useGLTF(url);

  // ----- CanvasTexture (demo renderer) -----
  const { canvas, ctx, tex } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1170;
    canvas.height = 2532;
    const ctx = canvas.getContext("2d");
    const tex = new THREE.CanvasTexture(canvas);
    tex.flipY = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return { canvas, ctx, tex };
  }, []);

  // Demo state machine (auto)
  const demo = useRef({
    step: 0, // 0 menu, 1 edit, 2 syncing, 3 live
    t: 0,
    price: 16.99,
    nextPrice: 18.49,
    progress: 0,
    manualUntil: 0,
  });

  const advanceStep = (now) => {
    const d = demo.current;
    d.step = (d.step + 1) % 4; // 0->1->2->3->0
    d.t = 0;
    d.progress = 0;
    // pause auto for a moment so user click feels like it "took over"
    d.manualUntil = now + 2.2;
    // little flash timing
    clickedAt.current = now;
  };

  function drawScreen() {
    const W = canvas.width;
    const H = canvas.height;
    // background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0B0F0E";
    ctx.fillRect(0, 0, W, H);
    // top bar
    ctx.fillStyle = "#101614";
    ctx.fillRect(0, 0, W, 140);
    ctx.fillStyle = "#F3F5F4";
    ctx.font = "700 64px Inter, system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Demo Restaurant", 80, 92);
    // live badge
    ctx.textAlign = "right";
    ctx.font = "600 40px Inter, system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillStyle = "#1E7A4A";
    ctx.fillText(demo.current.step >= 3 ? "Live" : "Preview", W - 80, 92);
    // section label
    ctx.textAlign = "left";
    ctx.fillStyle = "#A6B0AA";
    ctx.font = "700 34px Inter, system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(demo.current.step === 1 ? "EDIT ITEM" : "PIZZA", 80, 220);

    const cardX = 80;
    let y = 280;
    const items = [
      { name: "Margherita Pizza", price: demo.current.step >= 3 ? demo.current.nextPrice : demo.current.price },
      { name: "Caesar Salad", price: 12.99 },
      { name: "Pasta Carbonara", price: 18.99 },
    ];

    function drawCard(label, value, highlight = false) {
      const w = W - 160;
      const h = 170;
      const r = 44;
      ctx.fillStyle = "#101614";
      ctx.strokeStyle = highlight ? "rgba(30,122,74,0.55)" : "rgba(27,36,32,1)";
      ctx.lineWidth = 6;
      // rounded rect
      ctx.beginPath();
      ctx.moveTo(cardX + r, y);
      ctx.arcTo(cardX + w, y, cardX + w, y + h, r);
      ctx.arcTo(cardX + w, y + h, cardX, y + h, r);
      ctx.arcTo(cardX, y + h, cardX, y, r);
      ctx.arcTo(cardX, y, cardX + w, y, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#F3F5F4";
      ctx.font = "650 48px Inter, system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, cardX + 44, y + 105);
      ctx.fillStyle = "#1E7A4A";
      ctx.textAlign = "right";
      ctx.font = "750 48px Inter, system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.fillText(`$${value.toFixed(2)}`, cardX + w - 44, y + 105);
      y += h + 34;
    }

    if (demo.current.step !== 1) {
      drawCard(items[0].name, items[0].price, demo.current.step >= 2);
      drawCard(items[1].name, items[1].price);
      drawCard(items[2].name, items[2].price);
    } else {
      // Edit screen
      drawCard("Margherita Pizza", demo.current.price, true);
      // slider
      const sx = 120;
      const sy = y + 80;
      const sw = W - 240;
      ctx.fillStyle = "rgba(166,176,170,0.25)";
      ctx.fillRect(sx, sy, sw, 18);
      const p = clamp((demo.current.price - 12) / (22 - 12), 0, 1);
      ctx.fillStyle = "#1E7A4A";
      ctx.fillRect(sx, sy, sw * p, 18);
      ctx.beginPath();
      ctx.arc(sx + sw * p, sy + 9, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#A6B0AA";
      ctx.font = "600 36px Inter, system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Drag to change price", 120, sy - 26);
      ctx.textAlign = "right";
      ctx.fillText(`$${demo.current.price.toFixed(2)}`, W - 120, sy - 26);
      y += 220;
    }

    // bottom CTA
    const btnW = W - 160;
    const btnH = 160;
    const btnX = 80;
    const btnY = H - 360;
    ctx.fillStyle = "#1E7A4A";
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(btnX + 52, btnY);
    ctx.arcTo(btnX + btnW, btnY, btnX + btnW, btnY + btnH, 52);
    ctx.arcTo(btnX + btnW, btnY + btnH, btnX, btnY + btnH, 52);
    ctx.arcTo(btnX, btnY + btnH, btnX, btnY, 52);
    ctx.arcTo(btnX, btnY, btnX + btnW, btnY, 52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#F3F5F4";
    ctx.font = "800 52px Inter, system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    const label =
      demo.current.step === 0 ? "Edit menu (demo)" :
        demo.current.step === 1 ? "Publish update" :
          demo.current.step === 2 ? "Syncing…" :
            "Replay demo";
    ctx.fillText(label, W / 2, btnY + 104);

    // syncing progress bar
    if (demo.current.step === 2) {
      const px = 140, py = btnY + 130, pw = W - 280, ph = 14;
      ctx.fillStyle = "rgba(245,245,245,0.22)";
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = "#F3F5F4";
      ctx.fillRect(px, py, pw * clamp(demo.current.progress, 0, 1), ph);
    }

    // footer microcopy
    ctx.fillStyle = "#A6B0AA";
    ctx.font = "600 30px Inter, system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText('"Update in seconds" — watch it happen.', W / 2, H - 140);

    // QR unchanged badge
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(16,22,20,0.92)";
    ctx.fillRect(W - 360, H - 220, 280, 90);
    ctx.strokeStyle = "rgba(27,36,32,1)";
    ctx.strokeRect(W - 360, H - 220, 280, 90);
    ctx.fillStyle = "#A6B0AA";
    ctx.font = "700 28px Inter, system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText("QR unchanged", W - 100, H - 165);

    // Hover/click affordance
    const now = demo.current._now || 0;
    const flash = Math.max(0, 1 - (now - clickedAt.current) / 0.25); // 250ms flash

    if (hovered.current) {
      // subtle glow frame
      ctx.strokeStyle = `rgba(30,122,74,${0.35 + 0.25 * flash})`;
      ctx.lineWidth = 14;
      ctx.strokeRect(26, 26, W - 52, H - 52);

      // hint pill
      const pillW = 420, pillH = 84, px = W - pillW - 80, py = 170;
      ctx.fillStyle = "rgba(16,22,20,0.88)";
      ctx.fillRect(px, py, pillW, pillH);
      ctx.strokeStyle = "rgba(27,36,32,1)";
      ctx.lineWidth = 4;
      ctx.strokeRect(px, py, pillW, pillH);

      ctx.fillStyle = "#F3F5F4";
      ctx.font = "750 34px Inter, system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Click to edit →", px + pillW / 2, py + 54);
    }

    tex.needsUpdate = true;
  }

  // Auto-fit + find screen mesh + apply texture
  useEffect(() => {
    if (!scene) return;

    if (onLoaded) onLoaded();

    console.log("✅ GLB model loaded successfully:", url);
    console.log("📦 Scene children count:", scene.children.length);

    // Auto-fit: center + scale to a target height
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    scene.position.x += -center.x;
    scene.position.y += -center.y;
    scene.position.z += -center.z;
    const targetHeight = 1.15;
    const scale = targetHeight / (size.y || 1);
    scene.scale.setScalar(scale);

    // Find screen mesh
    console.log("📱 iPhoneModel mounted, finding screen mesh...");

    let screenFound = null;

    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      const matName = (obj.material?.name || "").toLowerCase();
      const name = (obj.name || "").toLowerCase();
      if (!screenFound && (matName.includes("display") || name.includes("screen") || name.includes("display"))) {
        screenFound = obj;
      }
      obj.castShadow = true;
      obj.receiveShadow = true;
    });

    if (!screenFound) {
      console.warn("⚠️ No screen mesh found.");
      return;
    }

    screenMeshRef.current = screenFound;

    console.log(`✅ Found screen mesh: "${screenFound.name}" | material: "${screenFound.material?.name}"`);

    // Apply texture (and make it pop)
    const applyScreen = (mesh) => {
      const mat = mesh.material;
      if (!mat) return;

      // Make the texture visible no matter what the model material is
      mat.map = tex;
      mat.emissiveMap = tex;
      mat.emissive = new THREE.Color("#ffffff");
      mat.emissiveIntensity = 1.25;

      // Remove "dark glass" behavior that hides UI
      mat.metalness = 0;
      mat.roughness = 0.25;

      // IMPORTANT: prevents tonemapping from dimming emissive UI
      mat.toneMapped = false;

      // Make sure base color doesn't tint the UI
      if (mat.color) mat.color.set("#ffffff");
      mat.needsUpdate = true;
    };

    if (screenFound) {
      applyScreen(screenFound);
    }

    // First paint
    drawScreen();
  }, [scene, url, onLoaded, tex]);

  // Animate demo loop + subtle phone motion
  useFrame((state, delta) => {
    // time for drawing flash / UI
    demo.current._now = state.clock.elapsedTime;

    if (!group.current) return;

    // premium float motion
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.35) * 0.25;
    group.current.rotation.x = Math.sin(t * 0.22) * 0.05;

    // demo loop timing
    const d = demo.current;
    d.t += delta;

    const now = state.clock.elapsedTime;
    const manual = now < d.manualUntil;

    // Still allow syncing progress even during manual pause
    if (d.step === 2) {
      d.progress = clamp(d.progress + delta * 0.65, 0, 1);
    }

    // Auto-advance only if not in manual pause
    if (!manual) {
      if (d.step === 0 && d.t > 2.2) { d.step = 1; d.t = 0; }
      else if (d.step === 1 && d.t > 2.2) { d.step = 2; d.t = 0; d.progress = 0; }
      else if (d.step === 2 && d.t > 1.8) { d.step = 3; d.t = 0; }
      else if (d.step === 3 && d.t > 2.0) {
        d.step = 0; d.t = 0;
        // little "edit" bump so the replay feels fresh
        d.price = d.price === 16.99 ? 15.99 : 16.99;
        d.nextPrice = d.price + 1.5;
      }

      // Edit step fake slider motion
      if (d.step === 1) {
        const wave = (Math.sin(d.t * 1.6) * 0.5 + 0.5); // 0..1
        d.price = 16.2 + wave * 2.1; // 16.2..18.3
        d.nextPrice = d.price + 0.2;
      }
    }

    // repaint every frame (cheap enough at this size)
    drawScreen();
  });

  return (
    <group
      ref={group}
      position={[0.35, -0.15, 0]}
      rotation={[0.05, -0.55, 0.02]}
      scale={1.45}
    >
      <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.28}>
        <primitive
          object={scene}
          onPointerOver={(e) => {
            // Only highlight if the hovered mesh IS the screen mesh
            if (screenMeshRef.current && (e.object === screenMeshRef.current || e.object.parent === screenMeshRef.current)) {
              hovered.current = true;
              document.body.style.cursor = "pointer";
            }
          }}
          onPointerOut={() => {
            hovered.current = false;
            document.body.style.cursor = "default";
          }}
          onPointerMove={(e) => {
            if (!screenMeshRef.current) return;
            const isScreen = e.object === screenMeshRef.current || e.object.parent === screenMeshRef.current;
            hovered.current = isScreen;
            document.body.style.cursor = isScreen ? "pointer" : "default";
          }}
          onPointerDown={(e) => {
            if (!screenMeshRef.current) return;

            const isScreen = e.object === screenMeshRef.current || e.object.parent === screenMeshRef.current;
            if (!isScreen) return;

            e.stopPropagation();
            const now = e.clock.elapsedTime;
            advanceStep(now);
          }}
        />
      </Float>
    </group>
  );
}

// Preload the model
useGLTF.preload("/models/scandish.glb");
