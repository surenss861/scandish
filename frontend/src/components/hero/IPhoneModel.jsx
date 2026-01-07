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
      toneMapped: false,
      transparent: false,
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

    // Make glass layers less opaque so screen shows through
    glassMeshes.forEach((glass) => {
      if (glass.material) {
        if (Array.isArray(glass.material)) {
          glass.material.forEach((mat) => {
            if (mat) {
              mat.opacity = 0.85; // Reduce glass opacity
              mat.transparent = true;
              mat.needsUpdate = true;
            }
          });
        } else {
          glass.material.opacity = 0.85;
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

  return <primitive object={root} scale={heroScale} />;
}

useGLTF.preload("/models/scandish.glb");
