import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { usePhoneDemoTexture } from "../../hooks/usePhoneDemoTexture.js";

export default function IPhoneModel({ heroScale = 2.6, onLoaded }) {
  const { scene } = useGLTF("/models/scandish.glb");
  const screenTex = usePhoneDemoTexture();

  const root = useMemo(() => scene.clone(true), [scene]); // safe clone

  useEffect(() => {
    // find a likely screen mesh
    let screen = null;

    root.traverse((obj) => {
      if (!screen && obj.type === "Mesh") {
        const name = obj.name.toLowerCase();
        const matName = obj.material?.name?.toLowerCase?.() ?? "";
        
        if (name.includes("screen") || name.includes("display") || 
            matName.includes("display") || matName.includes("screen")) {
          screen = obj;
        }
      }
    });

    // fallback: pick the flattest big mesh facing forward
    if (!screen) {
      let best = null;
      root.traverse((obj) => {
        if (obj.type !== "Mesh") return;
        const mesh = obj;
        const box = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        box.getSize(size);
        const flatness = Math.max(size.x, size.y) / Math.max(1e-6, size.z);
        const area = size.x * size.y;
        const score = flatness * area;
        if (!best || score > best.score) best = { mesh, score };
      });
      screen = best?.mesh ?? null;
    }

    if (screen) {
      console.log("✅ Found screen mesh:", screen.name, "| material:", screen.material?.name);
      
      const mat = new THREE.MeshBasicMaterial({
        map: screenTex,
        toneMapped: false,
      });
      screen.material = mat;
      screen.material.needsUpdate = true;

      // Hide holder/stand meshes
      const holderNames = ["holder", "stand", "base", "mount", "support", "dock"];
      root.traverse((obj) => {
        if (obj.isMesh) {
          const name = (obj.name ?? "").toLowerCase();
          const matName = obj.material?.name?.toLowerCase?.() ?? "";
          if (holderNames.some(h => name.includes(h) || matName.includes(h))) {
            obj.visible = false;
          }
        }
      });

      onLoaded?.();
    } else {
      console.warn("⚠️ Screen mesh not found");
      const names = [];
      root.traverse((o) => {
        if (o.isMesh) names.push({ name: o.name, mat: o.material?.name });
      });
      console.table(names);
    }
  }, [root, screenTex, onLoaded]);

  return <primitive object={root} scale={heroScale} />;
}

useGLTF.preload("/models/scandish.glb");
