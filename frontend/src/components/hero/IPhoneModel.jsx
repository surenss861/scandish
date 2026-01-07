import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function IPhoneModel({ url = "/models/scandish.glb", onLoaded }) {
  const group = useRef(null);
  
  console.log("🔵 IPhoneModel component rendering, loading:", url);
  
  // Load the GLB model
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    if (scene && onLoaded) {
      onLoaded();
      console.log("✅ GLB model loaded successfully:", url);
      console.log("📦 Scene children count:", scene.children.length);
      
      // Log bounding box to understand model size
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      console.log("📐 Model bounding box:", { size, center });
    }
  }, [scene, url, onLoaded]);

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

    // Based on GLTF: Screen_14 node contains Display material (material index 14)
    // Try to find by node name first
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
          
          // Check for Display material (from GLTF: material index 14 is "Display")
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

    if (!screenFound) {
      console.warn("⚠️ No display mesh found. Logging all meshes:");
      const names = [];
      scene.traverse((obj) => {
        if (obj.isMesh) {
          const name = obj.name || "unnamed";
          const matName = obj.material?.name || "no material";
          names.push({ name, matName });
        }
      });
      console.table(names);
    }

    // Enhance other materials
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          // Don't override display material
          if (!obj.material.name?.toLowerCase().includes("display")) {
            obj.material.metalness = Math.min(0.9, obj.material.metalness ?? 0.4);
            obj.material.roughness = Math.max(0.2, obj.material.roughness ?? 0.35);
          }
        }
      }
    });
  }, [scene, screenTex]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.35) * 0.25;
    group.current.rotation.x = Math.sin(t * 0.22) * 0.05;
  });

  // Calculate scale based on model size (model is ~0.07 units tall, scale to ~2 units)
  const scale = 30; // Much larger scale to make it visible

  return (
    <group ref={group} position={[0, 0, 0]} scale={scale}>
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.35}>
        <primitive object={scene} />
      </Float>
    </group>
  );
}

// Preload the model
useGLTF.preload("/models/scandish.glb");
