import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function IPhoneModel({ url = "/models/scandish.glb", onLoaded }) {
  const group = useRef(null);
  const sceneRef = useRef(null);

  console.log("🔵 IPhoneModel component rendering, loading:", url);

  // Load the GLB model
  const { scene } = useGLTF(url);

  // Auto-fit model to target size
  useEffect(() => {
    if (!scene) return;

    // Auto-fit model to a target height (mutate original scene)
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    console.log("📐 Model bounding box:", {
      size: { x: size.x.toFixed(3), y: size.y.toFixed(3), z: size.z.toFixed(3) },
      center: { x: center.x.toFixed(3), y: center.y.toFixed(3), z: center.z.toFixed(3) }
    });

    // Center it
    scene.position.sub(center);

    // Scale it (target height in "three units")
    const targetHeight = 1.6;
    const scaleFactor = targetHeight / size.y;
    scene.scale.setScalar(scaleFactor);

    console.log("✅ Auto-scaled model:", { scaleFactor: scaleFactor.toFixed(3), targetHeight });

    sceneRef.current = scene; // Store reference for screen texture

    if (onLoaded) {
      onLoaded();
      console.log("✅ GLB model loaded and auto-fitted successfully:", url);
    }
  }, [scene, url, onLoaded]);

  // Create screen texture from canvas (menu preview - mock of the website)
  const canvas = document.createElement("canvas");
  canvas.width = 1170;
  canvas.height = 2532;
  const ctx = canvas.getContext("2d");

  // Draw menu preview (mock of the actual menu page)
  ctx.fillStyle = "#0B0F0E";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header bar
  ctx.fillStyle = "#101614";
  ctx.fillRect(0, 0, canvas.width, 120);

  // Restaurant name
  ctx.fillStyle = "#F3F5F4";
  ctx.font = "bold 70px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Demo Restaurant", canvas.width / 2, 75);

  // Menu items
  let yPos = 250;
  const items = [
    { name: "Margherita Pizza", price: "$16.99", category: "Pizza" },
    { name: "Caesar Salad", price: "$12.99", category: "Salads" },
    { name: "Pasta Carbonara", price: "$18.99", category: "Pasta" },
  ];

  // Category header
  ctx.fillStyle = "#A6B0AA";
  ctx.font = "600px 40px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("PIZZA", 80, 220);

  items.forEach((item) => {
    // Item card background
    ctx.fillStyle = "#101614";
    ctx.fillRect(60, yPos - 30, canvas.width - 120, 80);

    // Item name
    ctx.fillStyle = "#F3F5F4";
    ctx.font = "50px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(item.name, 80, yPos + 20);

    // Price
    ctx.fillStyle = "#1E7A4A";
    ctx.textAlign = "right";
    ctx.fillText(item.price, canvas.width - 80, yPos + 20);

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

    // Based on GLTF: Screen_14 node contains Display material (material index 14)
    const screenNode = scene.getObjectByName("Screen_14");
    let screenFound = false;

    if (screenNode) {
      console.log("✅ Found Screen_14 node");
      screenNode.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          const matName = obj.material.name || "";
          if (matName.toLowerCase().includes("display")) {
            console.log(`✅ Found display mesh: "${obj.name}" | material: "${matName}"`);
            obj.material.map = screenTex;
            obj.material.emissive = new THREE.Color("#ffffff");
            obj.material.emissiveIntensity = 0.6;
            obj.material.needsUpdate = true;
            screenFound = true;
          }
        }
      });
    }

    // Also try direct material name search
    if (!screenFound) {
      scene.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          const name = obj.name || "unnamed";
          const matName = obj.material.name || "no material";

          if (matName.toLowerCase().includes("display")) {
            console.log(`✅ Found display mesh: "${name}" | material: "${matName}"`);
            obj.material.map = screenTex;
            obj.material.emissive = new THREE.Color("#ffffff");
            obj.material.emissiveIntensity = 0.6;
            obj.material.needsUpdate = true;
            screenFound = true;
          }
        }
      });
    }

    // Enhance other materials
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material && !obj.material.name?.toLowerCase().includes("display")) {
          obj.material.metalness = Math.min(0.9, obj.material.metalness ?? 0.4);
          obj.material.roughness = Math.max(0.2, obj.material.roughness ?? 0.35);
        }
      }
    });
  }, [screenTex]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.35) * 0.25;
    group.current.rotation.x = Math.sin(t * 0.22) * 0.05;
  });

  // Auto-fitted model - simple positioning
  if (!scene) return null;

  return (
    <group ref={group} position={[0, -0.2, 0]}>
      <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.22}>
        <primitive object={scene} />
      </Float>
    </group>
  );
}

// Preload the model
useGLTF.preload("/models/scandish.glb");
