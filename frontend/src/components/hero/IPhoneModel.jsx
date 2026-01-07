import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { usePhoneDemoTexture } from "../../hooks/usePhoneDemoTexture.js";

// Screen mesh is "Object_55" with material "Display"
const SCREEN_MESH_NAME = "Object_55";

function applyTextureToMesh(mesh, tex) {
  tex.flipY = false;
  tex.needsUpdate = true;

  const makeMat = () =>
    new THREE.MeshBasicMaterial({
      map: tex,
      toneMapped: false, // Critical: don't tone map the screen
      transparent: false,
      // Add subtle emissive so it glows like OLED
      emissive: new THREE.Color(0x1a1a1a),
      emissiveIntensity: 0.3,
    });

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

  const root = useMemo(() => scene.clone(true), [scene]);

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
    let screenMesh = null;
    const glassMeshes = [];

    root.traverse((obj) => {
      if (obj.isMesh) {
        // Find screen mesh (Object_55 with Display material)
        if (obj.name === SCREEN_MESH_NAME) {
          screenMesh = obj;
        }
        // Find glass layers (Object_14, Object_53 with Glass material)
        const matName = obj.material?.name?.toLowerCase?.() ?? "";
        if (matName.includes("glass")) {
          glassMeshes.push(obj);
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

    console.log("✅ Applying texture to screen mesh:", screenMesh.name);
    applyTextureToMesh(screenMesh, screenTex);

    // Aggressively reduce glass dominance - hide front glass if needed
    glassMeshes.forEach((glass, idx) => {
      if (glass.material) {
        // Hide glass meshes that are likely in front of screen (Object_14, Object_53)
        const name = (glass.name ?? "").toLowerCase();
        if (name.includes("glass") && (name.includes("14") || name.includes("53") || name.includes("front"))) {
          // Option: hide completely for bulletproof visibility
          // glass.visible = false;
          // Or: make it very transparent
          if (Array.isArray(glass.material)) {
            glass.material.forEach((mat) => {
              if (mat) {
                mat.opacity = 0.5; // Very transparent
                mat.transparent = true;
                if (mat.metalness !== undefined) mat.metalness = 0.1;
                if (mat.roughness !== undefined) mat.roughness = 0.8;
                mat.needsUpdate = true;
              }
            });
          } else {
            glass.material.opacity = 0.5;
            glass.material.transparent = true;
            if (glass.material.metalness !== undefined) glass.material.metalness = 0.1;
            if (glass.material.roughness !== undefined) glass.material.roughness = 0.8;
            glass.material.needsUpdate = true;
          }
        } else {
          // Other glass (bezel, back) - keep but reduce
          if (Array.isArray(glass.material)) {
            glass.material.forEach((mat) => {
              if (mat) {
                mat.opacity = 0.7;
                mat.transparent = true;
                if (mat.metalness !== undefined) mat.metalness = Math.min(0.3, mat.metalness);
                if (mat.roughness !== undefined) mat.roughness = Math.max(0.6, mat.roughness);
                mat.needsUpdate = true;
              }
            });
          } else {
            glass.material.opacity = 0.7;
            glass.material.transparent = true;
            if (glass.material.metalness !== undefined) glass.material.metalness = Math.min(0.3, glass.material.metalness);
            if (glass.material.roughness !== undefined) glass.material.roughness = Math.max(0.6, glass.material.roughness);
            glass.material.needsUpdate = true;
          }
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

  return <primitive object={root} scale={heroScale} />;
}

useGLTF.preload("/models/scandish.glb");
