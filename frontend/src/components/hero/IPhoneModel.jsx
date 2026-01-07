import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { usePhoneDemoTexture } from "../../hooks/usePhoneDemoTexture.js";

// Screen mesh is "Object_55" with material "Display" - we'll apply texture directly to it
const SCREEN_MESH_NAME = "Object_55";

export default function IPhoneModel({ heroScale = 2.45, onLoaded }) {
  const { scene } = useGLTF("/models/scandish.glb");
  const screenTex = usePhoneDemoTexture();

  // CRITICAL: Don't clone - modify the actual scene instance that gets rendered
  const root = useMemo(() => scene, [scene]);

  // Apply texture directly to original screen mesh + hide problematic blockers
  useEffect(() => {
    if (!screenTex || !screenTex.image) {
      console.warn("⚠️ Screen texture not ready yet");
      return;
    }

    let foundScreenMesh = null;
    const glassMeshes = [];
    const notchMeshes = []; // Camera, notch, speaker - keep visible
    const filterMeshes = []; // Mirror_filter, Tint_back_glass, etc.

    root.traverse((obj) => {
      if (obj.isMesh) {
        // Find screen mesh (Object_55) - we'll apply texture directly to it
        if (obj.name === SCREEN_MESH_NAME) {
          foundScreenMesh = obj;
        }
        // Find glass layers
        const matName = obj.material?.name?.toLowerCase?.() ?? "";
        const objName = (obj.name ?? "").toLowerCase();
        if (matName.includes("glass") || objName.includes("glass")) {
          glassMeshes.push(obj);
        }
        // Find notch/camera/speaker meshes (keep visible for realism)
        if (objName.includes("camera") || objName.includes("notch") || objName.includes("speaker") ||
          matName.includes("camera") || matName.includes("sapphire") ||
          (objName.includes("filter") && (objName.includes("camera") || objName.includes("37") || objName.includes("18") || objName.includes("28") || objName.includes("7")))) {
          notchMeshes.push(obj);
        }
        // Find filter/overlay meshes (tint, mirror - these block screen)
        if ((objName.includes("filter") || objName.includes("mirror") || objName.includes("tint") ||
          matName.includes("filter") || matName.includes("mirror") || matName.includes("tint")) &&
          !notchMeshes.includes(obj)) {
          filterMeshes.push(obj);
        }
      }
    });

    // ✅ Apply texture directly to original screen mesh (no replacement plane)
    if (foundScreenMesh) {
      console.log("✅ Found screen mesh:", foundScreenMesh.name);
      
      // Configure texture for GLTF mesh (flipY = false for GLTF)
      screenTex.flipY = false; // GLTF UVs expect flipY = false
      screenTex.needsUpdate = true;
      screenTex.wrapS = THREE.ClampToEdgeWrapping;
      screenTex.wrapT = THREE.ClampToEdgeWrapping;
      screenTex.minFilter = THREE.LinearFilter;
      screenTex.magFilter = THREE.LinearFilter;
      screenTex.generateMipmaps = false;
      screenTex.colorSpace = THREE.SRGBColorSpace;

      // Replace material with MeshBasicMaterial (unlit, bright, no tone mapping)
      const material = new THREE.MeshBasicMaterial({
        map: screenTex,
        color: new THREE.Color(0xffffff),
        toneMapped: false, // Critical: don't tone map the screen
        transparent: false,
      });
      material.needsUpdate = true;

      if (Array.isArray(foundScreenMesh.material)) {
        foundScreenMesh.material = foundScreenMesh.material.map(() => material);
      } else {
        foundScreenMesh.material = material;
      }

      foundScreenMesh.material.needsUpdate = true;
      foundScreenMesh.visible = true; // Keep it visible!
      
      console.log("✅ Applied texture to original screen mesh");
    } else {
      console.error("❌ Screen mesh not found:", SCREEN_MESH_NAME);
    }

    // Hide tint/mirror filters that block the screen (but keep camera/notch)
    filterMeshes.forEach((filter) => {
      const name = (filter.name ?? "").toLowerCase();
      const matName = filter.material?.name?.toLowerCase?.() ?? "";
      // Hide tint/mirror filters, but keep camera-related ones
      if (name.includes("tint") || matName.includes("tint") ||
        (name.includes("mirror") && !name.includes("camera") && !name.includes("sapphire"))) {
        console.log("🚫 Hiding tint/mirror filter:", filter.name);
        filter.visible = false;
      }
    });

    // Keep notch/camera meshes visible (full opacity) - these create the cutout
    notchMeshes.forEach((notch) => {
      console.log("✅ Keeping notch/camera visible:", notch.name);
      notch.visible = true;
      // Ensure they render on top
      if (notch.material) {
        if (Array.isArray(notch.material)) {
          notch.material.forEach((mat) => {
            if (mat) {
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.needsUpdate = true;
            }
          });
        } else {
          notch.material.transparent = false;
          notch.material.opacity = 1.0;
          notch.material.needsUpdate = true;
        }
      }
      notch.renderOrder = 1000; // Render last (on top)
    });

    // Hide GLB front glass/tint that covers the whole screen (brittle materials)
    glassMeshes.forEach((glass) => {
      const name = (glass.name ?? "").toLowerCase();
      const matName = glass.material?.name?.toLowerCase?.() ?? "";

      // Hide GLB front glass/tint that covers the whole screen (brittle materials)
      if (name.includes("14") || name.includes("53") || name.includes("front") ||
        name.includes("tint") || matName.includes("tint") ||
        (name.includes("glass") && (name.includes("front") || name.includes("display")))) {
        console.log("🚫 Hiding GLB front glass/tint (brittle):", glass.name);
        glass.visible = false;
      } else {
        // Other glass (bezel, back) - make transparent
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

  return (
    <group>
      {/* Original iPhone model with texture applied directly to screen mesh */}
      <primitive object={root} scale={heroScale} />
    </group>
  );
}

useGLTF.preload("/models/scandish.glb");
