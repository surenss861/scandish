import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function IPhoneModel({ url = "/models/iphone17-pro.glb" }) {
  const group = useRef(null);
  const [screenTexture, setScreenTexture] = useState(null);
  const [meshNames, setMeshNames] = useState([]);

  // Load the GLB model
  const { scene } = useGLTF(url);

  // Log when component mounts
  useEffect(() => {
    console.log("📱 iPhoneModel component mounted, GLB loaded");
  }, []);

  // Create screen texture (menu preview)
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1170; // iPhone 17 Pro screen resolution
    canvas.height = 2532;
    const ctx = canvas.getContext("2d");

    // Draw menu preview
    // Background
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
      { name: "Margherita Pizza", price: "$16.99" },
      { name: "Caesar Salad", price: "$12.99" },
      { name: "Pasta Carbonara", price: "$18.99" },
    ];

    items.forEach((item) => {
      // Item name
      ctx.fillStyle = "#F3F5F4";
      ctx.font = "50px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(item.name, 80, yPos);

      // Price
      ctx.fillStyle = "#1E7A4A";
      ctx.textAlign = "right";
      ctx.fillText(item.price, canvas.width - 80, yPos);

      yPos += 120;
    });

    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    setScreenTexture(texture);
    console.log("✅ Screen texture created");
  }, []);

  // Debug: Log all mesh names (check console to identify screen mesh)
  useMemo(() => {
    const names = [];
    scene.traverse((obj) => {
      if (obj.isMesh) {
        const name = obj.name || "unnamed";
        const matName = obj.material?.name || "no material";
        names.push({ name, matName, obj });
      }
    });

    console.log("📱 iPhone GLB meshes found:", names.length);
    if (names.length > 0) {
      console.table(names.map(n => ({ Mesh: n.name, Material: n.matName })));
      // Also log as array for easy searching
      console.log("📋 All mesh names:", names.map(n => n.name));
    } else {
      console.warn("⚠️ No meshes found in GLB model!");
    }
    setMeshNames(names);
  }, [scene]);

  // Apply screen texture to screen mesh
  useMemo(() => {
    if (!screenTexture || meshNames.length === 0) {
      if (!screenTexture) console.log("⏳ Waiting for screen texture...");
      if (meshNames.length === 0) console.log("⏳ Waiting for mesh names...");
      return;
    }

    let screenFound = false;

    scene.traverse((obj) => {
      if (!obj.isMesh) return;

      const name = (obj.name || "").toLowerCase();
      const matName = (obj.material?.name || "").toLowerCase();

      // Check for screen-related names (common patterns)
      const isScreen =
        name.includes("screen") ||
        name.includes("display") ||
        name.includes("glass") ||
        name.includes("front") ||
        name.includes("lcd") ||
        name.includes("panel") ||
        name.includes("screen_") ||
        matName.includes("screen") ||
        matName.includes("display") ||
        matName.includes("emissive") ||
        matName.includes("lcd");

      if (isScreen) {
        console.log("✅ Found screen mesh:", name, "| material:", matName);
        screenFound = true;

        // Create new material with screen texture
        obj.material = new THREE.MeshStandardMaterial({
          map: screenTexture,
          emissive: new THREE.Color("#ffffff"),
          emissiveIntensity: 0.85,
          metalness: 0.0,
          roughness: 0.35,
        });
        obj.material.needsUpdate = true;
      } else {
        // For non-screen meshes, enhance materials
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          obj.material.metalness = Math.min(0.9, obj.material.metalness ?? 0.4);
          obj.material.roughness = Math.max(0.2, obj.material.roughness ?? 0.35);
        }
      }
    });

    if (!screenFound) {
      console.warn("⚠️ No screen mesh detected. Check console table above for mesh names.");
      console.log("💡 Tip: Look for meshes with names like 'screen', 'display', 'glass', 'front', 'lcd'");
      console.log("💡 If you see the mesh names, share them and I can update the detection logic!");
    }
  }, [scene, screenTexture, meshNames]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.35) * 0.25;
    group.current.rotation.x = Math.sin(t * 0.22) * 0.05;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.35}>
      <group ref={group} position={[0, -0.2, 0]} scale={1.2}>
        <primitive object={scene} />
      </group>
    </Float>
  );
}

// Preload the model
useGLTF.preload("/models/iphone17-pro.glb");
