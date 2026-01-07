import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function IPhoneModel({ url = "/models/iphone_17_pro.glb" }) {
  const group = useRef(null);

  console.log("🔵 IPhoneModel component rendering, loading:", url);

  // Load the GLB model
  let scene;
  let glbError = null;

  try {
    const result = useGLTF(url);
    scene = result.scene;
    console.log("✅ GLB model loaded successfully:", url);
    console.log("📦 Scene object:", scene);
    console.log("📦 Scene children count:", scene.children.length);
  } catch (error) {
    console.error("❌ Failed to load GLB model:", error);
    glbError = error;
  }

  // Create screen texture from canvas (menu preview)
  const canvas = document.createElement("canvas");
  canvas.width = 1170;
  canvas.height = 2532;
  const ctx = canvas.getContext("2d");

  // Draw menu preview
  ctx.fillStyle = "#0B0F0E";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#101614";
  ctx.fillRect(0, 0, canvas.width, 120);
  ctx.fillStyle = "#F3F5F4";
  ctx.font = "bold 70px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Demo Restaurant", canvas.width / 2, 75);

  let yPos = 250;
  const items = [
    { name: "Margherita Pizza", price: "$16.99" },
    { name: "Caesar Salad", price: "$12.99" },
    { name: "Pasta Carbonara", price: "$18.99" },
  ];

  items.forEach((item) => {
    ctx.fillStyle = "#F3F5F4";
    ctx.font = "50px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(item.name, 80, yPos);
    ctx.fillStyle = "#1E7A4A";
    ctx.textAlign = "right";
    ctx.fillText(item.price, canvas.width - 80, yPos);
    yPos += 120;
  });

  const screenTex = new THREE.CanvasTexture(canvas);
  screenTex.flipY = false;
  screenTex.colorSpace = THREE.SRGBColorSpace;

  useEffect(() => {
    if (!scene) {
      console.error("❌ Scene is null, cannot apply screen texture");
      return;
    }

    console.log("📱 iPhoneModel mounted, finding screen mesh...");
    console.log("📦 GLB URL:", url);

    // Try multiple common screen mesh names
    const screenNames = ["Screen", "screen", "Display", "display", "Glass", "glass", "Front", "front", "LCD", "lcd", "Screen_0", "screen_0"];
    let screenFound = false;

    // First try getObjectByName (fastest)
    for (const name of screenNames) {
      const screen = scene.getObjectByName(name);
      if (screen?.isMesh && screen.material) {
        console.log(`✅ Found screen mesh: "${name}"`);
        screen.material.map = screenTex;
        screen.material.emissive = new THREE.Color("#ffffff");
        screen.material.emissiveIntensity = 0.6;
        screen.material.needsUpdate = true;
        screenFound = true;
        break;
      }
    }

    // If not found, traverse and check names/materials
    if (!screenFound) {
      const names = [];
      scene.traverse((obj) => {
        if (obj.isMesh) {
          const name = obj.name || "unnamed";
          const matName = obj.material?.name || "no material";
          names.push({ name, matName });

          const nameLower = name.toLowerCase();
          const matLower = matName.toLowerCase();

          if (
            nameLower.includes("screen") ||
            nameLower.includes("display") ||
            nameLower.includes("glass") ||
            nameLower.includes("front") ||
            nameLower.includes("lcd") ||
            nameLower.includes("panel") ||
            matLower.includes("screen") ||
            matLower.includes("display") ||
            matLower.includes("emissive")
          ) {
            console.log(`✅ Found screen mesh: "${name}" | material: "${matName}"`);
            obj.material.map = screenTex;
            obj.material.emissive = new THREE.Color("#ffffff");
            obj.material.emissiveIntensity = 0.6;
            obj.material.needsUpdate = true;
            screenFound = true;
          }
        }
      });

      if (!screenFound) {
        console.warn("⚠️ No screen mesh found. Available meshes:");
        console.table(names);
        console.log("💡 All mesh names:", names.map(n => n.name));
      }
    }

    // Enhance other materials
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material && !screenFound) {
          obj.material.metalness = Math.min(0.9, obj.material.metalness ?? 0.4);
          obj.material.roughness = Math.max(0.2, obj.material.roughness ?? 0.35);
        }
      }
    });
  }, [scene, screenTex, url]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.35) * 0.25;
    group.current.rotation.x = Math.sin(t * 0.22) * 0.05;
  });

  // If GLB failed to load, show error mesh
  if (glbError || !scene) {
    console.error("❌ Returning error placeholder");
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 5, 0.3]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
      </mesh>
    );
  }

  console.log("✅ Rendering iPhone model with scene");

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.35}>
      <group ref={group} position={[0, 0, 0]} scale={2}>
        <primitive object={scene} />
      </group>
    </Float>
  );
}

// Preload the model
useGLTF.preload("/models/iphone_17_pro.glb");
