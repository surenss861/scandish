import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { usePhoneDemoTexture } from "../../hooks/usePhoneDemoTexture.js";

// Screen mesh is "Object_55" with material "Display"
const SCREEN_MESH_NAME = "Object_55";

function applyTextureToMesh(mesh, tex) {
  // Configure texture properly
  if (!tex || !tex.image) {
    console.error("❌ Texture or texture image is null!");
    return;
  }

  console.log("🎨 Applying texture:", {
    width: tex.image.width,
    height: tex.image.height,
    format: tex.format,
    type: tex.type
  });

  tex.flipY = false; // Critical: match GLTF UV expectations
  tex.needsUpdate = true;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false; // Disable mipmaps for crisp text
  tex.colorSpace = THREE.SRGBColorSpace; // Ensure sRGB for proper whites

  // Option A: MeshBasicMaterial (unlit billboard) - simplest + most reliable
  // MeshBasicMaterial doesn't support emissive properties, so we use map only
  const makeMat = () => {
    const mat = new THREE.MeshBasicMaterial({
      map: tex, // The demo texture as the main map
      color: new THREE.Color(0xffffff), // Pure white so texture shows at full brightness
      toneMapped: false, // Critical: don't tone map the screen
      transparent: false,
    });
    mat.needsUpdate = true;
    console.log("✅ Created MeshBasicMaterial with map:", !!mat.map);
    return mat;
  };

  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(() => makeMat());
  } else {
    mesh.material = makeMat();
  }

  mesh.material.needsUpdate = true;
}

export default function IPhoneModel({ heroScale = 2.45, onLoaded }) {
  const { scene } = useGLTF("/models/scandish.glb");
  const screenTex = usePhoneDemoTexture();

  // CRITICAL: Don't clone - modify the actual scene instance that gets rendered
  // Cloning was causing us to modify the wrong object
  const root = useMemo(() => scene, [scene]);

  // Debug: Print mesh info to find the real screen mesh
  useEffect(() => {
    const meshes = [];

    root.traverse((obj) => {
      if (obj.isMesh) {
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        box.getSize(size);

        const area = size.x * size.y;
        const flat = Math.max(size.x, size.y) / Math.max(1e-6, size.z);

        meshes.push({ name: obj.name, area, flat, material: obj.material?.name });
      }
    });

    console.log("📱 Mesh analysis (sorted by screen-likeness):");
    meshes
      .sort((a, b) => b.flat * b.area - a.flat * a.area)
      .slice(0, 25)
      .forEach((m) =>
        console.log(
          "[mesh]",
          m.name,
          "| material:",
          m.material,
          "| area:",
          m.area.toFixed(4),
          "| flat:",
          m.flat.toFixed(1)
        )
      );
  }, [root]);

  // Apply texture to the hard-targeted screen mesh
  useEffect(() => {
    if (!screenTex || !screenTex.image) {
      console.warn("⚠️ Screen texture not ready yet");
      return;
    }
    
    let screenMesh = null;
    const glassMeshes = [];
    const filterMeshes = []; // Mirror_filter, Tint_back_glass, etc.

    root.traverse((obj) => {
      if (obj.isMesh) {
        // Find screen mesh (Object_55 with Display material)
        if (obj.name === SCREEN_MESH_NAME) {
          screenMesh = obj;
        }
        // Find glass layers
        const matName = obj.material?.name?.toLowerCase?.() ?? "";
        const objName = (obj.name ?? "").toLowerCase();
        if (matName.includes("glass") || objName.includes("glass")) {
          glassMeshes.push(obj);
        }
        // Find filter/overlay meshes that might block the screen
        if (objName.includes("filter") || objName.includes("mirror") || objName.includes("tint") || 
            matName.includes("filter") || matName.includes("mirror") || matName.includes("tint")) {
          filterMeshes.push(obj);
        }
      }
    });

    if (!screenMesh) {
      console.warn(
        "⚠️ Screen mesh not found. Name =",
        SCREEN_MESH_NAME,
        "\nCheck console above for available mesh names."
      );
      return;
    }

    const box = new THREE.Box3().setFromObject(screenMesh);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    console.log("✅ Found screen mesh:", screenMesh.name);
    console.log("📐 Screen mesh bounds:", size.x.toFixed(3), "x", size.y.toFixed(3), "x", size.z.toFixed(3));
    console.log("🎨 Texture dimensions:", screenTex.image.width, "x", screenTex.image.height);
    console.log("🔍 Found filter/overlay meshes:", filterMeshes.map(m => m.name));
    
    // STEP 1: Hide ALL filter/overlay meshes that might block the screen
    filterMeshes.forEach((filter) => {
      console.log("🚫 Hiding filter/overlay mesh:", filter.name);
      filter.visible = false;
    });
    
    // STEP 2: Hide front glass layers completely
    glassMeshes.forEach((glass) => {
      const name = (glass.name ?? "").toLowerCase();
      const matName = glass.material?.name?.toLowerCase?.() ?? "";
      if (name.includes("14") || name.includes("53") || name.includes("front") || 
          name.includes("tint") || matName.includes("tint") || matName.includes("mirror")) {
        console.log("🚫 Hiding front glass:", glass.name);
        glass.visible = false;
      } else {
        // Other glass - make very transparent
        if (Array.isArray(glass.material)) {
          glass.material.forEach((mat) => {
            if (mat) {
              mat.opacity = 0.3;
              mat.transparent = true;
              mat.needsUpdate = true;
            }
          });
        } else {
          glass.material.opacity = 0.3;
          glass.material.transparent = true;
          glass.material.needsUpdate = true;
        }
      }
    });
    
    // STEP 3: Apply bright test material first (prove we can change the screen)
    // Temporarily use a bright neon color to verify material replacement works
    const testMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00ff00), // Bright green
      toneMapped: false,
    });
    
    if (Array.isArray(screenMesh.material)) {
      // Multi-material: replace all slots
      screenMesh.material = screenMesh.material.map(() => testMaterial);
      console.log("✅ Applied test material to multi-material mesh (", screenMesh.material.length, "slots)");
    } else {
      screenMesh.material = testMaterial;
      console.log("✅ Applied test material to single-material mesh");
    }
    
    screenMesh.visible = true;
    screenMesh.material.needsUpdate = true;
    
    // After 2 seconds, switch to actual texture
    const timeout = setTimeout(() => {
      console.log("🎨 Switching from test material to texture...");
      applyTextureToMesh(screenMesh, screenTex);
      
      // Force material update
      if (screenMesh.material) {
        if (Array.isArray(screenMesh.material)) {
          screenMesh.material.forEach(mat => {
            if (mat) {
              mat.needsUpdate = true;
              if (mat.map) mat.map.needsUpdate = true;
            }
          });
        } else {
          screenMesh.material.needsUpdate = true;
          if (screenMesh.material.map) screenMesh.material.map.needsUpdate = true;
        }
      }
      
      console.log("✅ Texture applied, material type:", screenMesh.material?.type || "array");
    }, 2000);
    
    return () => clearTimeout(timeout);

    // Hide holder/stand meshes
    const holderNames = ["holder", "stand", "base", "mount", "support", "dock"];
    root.traverse((obj) => {
      if (obj.isMesh) {
        const name = (obj.name ?? "").toLowerCase();
        const matName = obj.material?.name?.toLowerCase?.() ?? "";
        if (holderNames.some((h) => name.includes(h) || matName.includes(h))) {
          obj.visible = false;
        }
      }
    });

    onLoaded?.();
  }, [root, screenTex, onLoaded]);

  return <primitive object={root} scale={heroScale} />;
}

useGLTF.preload("/models/scandish.glb");
