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
    const allPotentialBlockers = []; // For diagnostics

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

        // Diagnostic: collect all potential blockers (flat, large area, front-facing)
        const blockerKeywords = ["14", "53", "front", "tint", "filter", "mirror", "display", "cover", "glass"];
        const isPotentialBlocker = blockerKeywords.some(kw =>
          objName.includes(kw) || matName.includes(kw)
        );
        if (isPotentialBlocker && obj !== foundScreenMesh) {
          const box = new THREE.Box3().setFromObject(obj);
          const size = new THREE.Vector3();
          box.getSize(size);
          const area = size.x * size.y;
          const flat = Math.max(size.x, size.y) / Math.max(1e-6, size.z);
          if (flat > 10 && area > 0.1) { // Flat and large = likely blocker
            allPotentialBlockers.push({
              name: obj.name,
              material: matName,
              area: area.toFixed(3),
              flat: flat.toFixed(1),
              visible: obj.visible
            });
          }
        }
      }
    });

    // Log all potential blockers for diagnostics
    if (allPotentialBlockers.length > 0) {
      console.log("🔍 POTENTIAL BLOCKERS FOUND:");
      allPotentialBlockers.forEach(b => {
        console.log(`  - ${b.name} | material: ${b.material} | area: ${b.area} | flat: ${b.flat} | visible: ${b.visible}`);
      });
    }

    // ✅ Apply texture directly to original screen mesh (no replacement plane)
    if (foundScreenMesh) {
      console.log("✅ Found screen mesh:", foundScreenMesh.name);

      // TEMPORARY: Make Object_55 neon to prove it's visible
      // If screen doesn't turn neon, something else is covering it
      const NEON_TEST = false; // Set to true to test
      if (NEON_TEST) {
        const neonMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0x00ff00), // Bright green
          toneMapped: false,
        });
        if (Array.isArray(foundScreenMesh.material)) {
          foundScreenMesh.material = foundScreenMesh.material.map(() => neonMat);
        } else {
          foundScreenMesh.material = neonMat;
        }
        foundScreenMesh.material.needsUpdate = true;
        foundScreenMesh.visible = true;
        console.log("🧪 NEON TEST: Object_55 should be bright green. If not, it's covered.");
        console.log("🧪 Check the phone screen - is it neon green or still grey?");
        // Don't return early - let the blocker detection run too
      }

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

    // AGGRESSIVELY hide ALL front glass/tint/filter/display meshes that could block the screen
    // These are the blockers causing the grey reflective slab
    const blockerNames = [
      "14", "53", "front", "tint", "filter", "mirror", "display", "screencover",
      "frontglass", "displayglass", "screen_glass", "cover"
    ];

    glassMeshes.forEach((glass) => {
      const name = (glass.name ?? "").toLowerCase();
      const matName = glass.material?.name?.toLowerCase?.() ?? "";

      // Check if this is a front-facing blocker (not bezel/back glass)
      const isBlocker = blockerNames.some(blocker =>
        name.includes(blocker) || matName.includes(blocker)
      );

      if (isBlocker) {
        console.log("🚫 HIDING BLOCKER:", glass.name, "| material:", matName);
        glass.visible = false; // Fully hide - no transparency tricks
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

    // Compute screen area from Object_55 (for relative detection)
    let screenArea = 0;
    if (foundScreenMesh) {
      foundScreenMesh.geometry.computeBoundingBox();
      const screenBbox = foundScreenMesh.geometry.boundingBox;
      if (screenBbox) {
        const screenSize = new THREE.Vector3();
        screenBbox.getSize(screenSize);
        screenArea = screenSize.x * screenSize.y;
        console.log("📐 Screen (Object_55) area:", screenArea.toFixed(6));
      }
    }
    
    // Also check ALL meshes for potential blockers (not just glass-labeled ones)
    // This catches meshes with generic names (Object_XX) that don't match keywords
    const flatLargeMeshes = []; // For area-based detection
    
    root.traverse((obj) => {
      if (obj.isMesh && obj !== foundScreenMesh) {
        const name = (obj.name ?? "").toLowerCase();
        const matName = obj.material?.name?.toLowerCase?.() ?? "";
        
        // Check if this looks like a front display blocker (keyword-based)
        const looksLikeBlocker = (
          (name.includes("mirror") && name.includes("filter")) ||
          (name.includes("tint") && name.includes("back")) ||
          (name.includes("front") && (name.includes("glass") || name.includes("display") || name.includes("cover"))) ||
          (matName.includes("tint") && matName.includes("back")) ||
          (matName.includes("mirror") && matName.includes("filter"))
        );
        
        if (looksLikeBlocker) {
          console.log("🚫 HIDING ADDITIONAL BLOCKER (keyword):", obj.name, "| material:", matName);
          obj.visible = false;
        }
        
        // Collect flat/large meshes for area-based detection (relative to screen)
        // These are likely cover meshes with generic names (Object_54, Object_52, etc.)
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        box.getSize(size);
        const area = size.x * size.y;
        const flat = Math.max(size.x, size.y) / Math.max(1e-6, size.z);
        
        // RELATIVE detection: area should be 0.6x to 1.6x screen area (cover is similar size)
        // Reduced flatness threshold (some covers have slight curvature/bevel)
        const areaRatio = screenArea > 0 ? area / screenArea : 0;
        const isCoverCandidate = (
          flat > 8 && // Reduced from 15 (more forgiving for slight curvature)
          areaRatio >= 0.6 && // At least 60% of screen area
          areaRatio <= 1.6 && // At most 160% of screen area (slightly larger is OK)
          obj !== foundScreenMesh
        );
        
        if (isCoverCandidate) {
          flatLargeMeshes.push({
            mesh: obj,
            name: obj.name,
            material: matName || (obj.material?.name ?? "unknown"),
            area: area,
            areaRatio: areaRatio,
            flat: flat,
            score: flat * areaRatio // Higher = more likely to be cover
          });
        }
      }
    });
    
    // Sort by "screen-likeness" (flat × area ratio) and hide the top candidates
    // These are likely cover meshes sitting in front of Object_55
    flatLargeMeshes.sort((a, b) => b.score - a.score);
    
    console.log("🔍 FLAT/LARGE MESHES (potential cover blockers, relative to Object_55):");
    if (flatLargeMeshes.length === 0) {
      console.log("  ⚠️ No candidates found. Check thresholds or screen area calculation.");
    } else {
      flatLargeMeshes.slice(0, 10).forEach((m, idx) => {
        console.log(`  ${idx + 1}. ${m.name} | material: ${m.material} | area: ${m.area.toFixed(6)} | areaRatio: ${m.areaRatio.toFixed(2)}x | flat: ${m.flat.toFixed(1)} | score: ${m.score.toFixed(2)}`);
      });
    }
    
    // Hide the top 3-5 flat/large meshes (these are likely cover meshes)
    // Object_55 should be in this list but we skip it
    const coverCandidates = flatLargeMeshes
      .filter(m => m.mesh.name !== SCREEN_MESH_NAME)
      .slice(0, 5); // Top 5 candidates
    
    coverCandidates.forEach((candidate) => {
      console.log("🚫 HIDING COVER CANDIDATE (flat/area):", candidate.name, "| material:", candidate.material, "| areaRatio:", candidate.areaRatio.toFixed(2) + "x");
      candidate.mesh.visible = false;
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
