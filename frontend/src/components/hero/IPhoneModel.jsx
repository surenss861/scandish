import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import PhoneDemoUI from "./PhoneDemoUI.jsx";

export default function IPhoneModel({ url = "/models/scandish.glb", onLoaded }) {
  const group = useRef(null);
  const screenMeshRef = useRef(null);
  const uiAnchorRef = useRef(null);
  
  console.log("🔵 IPhoneModel component rendering, loading:", url);
  
  // Load the GLB model
  const { scene } = useGLTF(url);
  
  // Auto-fit model to target size
  useEffect(() => {
    if (!scene) return;
    
    // 1) Compute bounds
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    
    console.log("📐 Model bounding box:", { 
      size: { x: size.x.toFixed(3), y: size.y.toFixed(3), z: size.z.toFixed(3) },
      center: { x: center.x.toFixed(3), y: center.y.toFixed(3), z: center.z.toFixed(3) }
    });
    
    // 2) Center model at origin
    scene.position.x += (scene.position.x - center.x);
    scene.position.y += (scene.position.y - center.y);
    scene.position.z += (scene.position.z - center.z);
    
    // 3) Scale to target height (smaller works better in a wide card)
    const targetHeight = 1.15;
    const scale = targetHeight / size.y;
    scene.scale.setScalar(scale);
    
    // 4) (Optional) slight lift so it sits nicer
    scene.position.y -= 0.05;
    
    console.log("✅ Auto-scaled model:", { scale: scale.toFixed(3), targetHeight });
    
    if (onLoaded) {
      onLoaded();
      console.log("✅ GLB model loaded and auto-fitted successfully:", url);
    }
  }, [scene, url, onLoaded]);

  // Find and store screen mesh reference
  useEffect(() => {
    if (!scene) return;

    console.log("📱 iPhoneModel mounted, finding screen mesh...");

    let found = null;

    // Try by name first
    const names = ["Screen_14", "Screen", "screen", "Display", "display", "Object_55"];
    for (const n of names) {
      const obj = scene.getObjectByName(n);
      if (obj?.isMesh) {
        found = obj;
        break;
      }
    }

    // Try by material name if not found
    if (!found) {
      scene.traverse((obj) => {
        if (found) return;
        if (!obj.isMesh) return;
        const matName = (obj.material?.name || "").toLowerCase();
        const name = (obj.name || "").toLowerCase();
        if (matName.includes("display") || name.includes("screen") || name.includes("display")) {
          found = obj;
        }
      });
    }

    if (found) {
      screenMeshRef.current = found;
      console.log(`✅ Screen mesh locked: "${found.name}" | material: "${found.material?.name || "unknown"}"`);
    } else {
      console.warn("⚠️ Screen mesh not found. (UI will still render but may not align.)");
    }

    // Enhance other materials
    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;
      if (obj.material && !obj.material.name?.toLowerCase().includes("display")) {
        obj.material.metalness = Math.min(0.9, obj.material.metalness ?? 0.4);
        obj.material.roughness = Math.max(0.2, obj.material.roughness ?? 0.35);
      }
    });
  }, [scene]);

  // Premium float / subtle rotation + keep UI anchored to screen
  useFrame((state) => {
    if (!group.current) return;

    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.35) * 0.18 - 0.55; // keep your angled base
    group.current.rotation.x = 0.05 + Math.sin(t * 0.22) * 0.03;
    group.current.rotation.z = 0.02;

    // Keep UI anchored to the screen mesh
    const screen = screenMeshRef.current;
    const anchor = uiAnchorRef.current;
    if (screen && anchor) {
      screen.updateWorldMatrix(true, false);

      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const scl = new THREE.Vector3();

      screen.matrixWorld.decompose(pos, quat, scl);

      anchor.position.copy(pos);
      anchor.quaternion.copy(quat);

      // scale UI to match screen size (tune multiplier if needed)
      const uniform = Math.max(scl.x, scl.y, scl.z);
      anchor.scale.setScalar(uniform);
    }
  });

  // Auto-fitted model - premium product hero angle
  if (!scene) return null;
  
  return (
    <group ref={group} position={[0.35, -0.15, 0]} scale={1.45}>
      <Float speed={1.0} rotationIntensity={0.12} floatIntensity={0.18}>
        <primitive object={scene} />
      </Float>

      {/* UI anchored to screen */}
      <group ref={uiAnchorRef}>
        <Html
          transform
          // IMPORTANT: allow clicking inside the UI
          style={{ pointerEvents: "auto" }}
          // This size is "virtual pixels" and gets scaled by transform
          distanceFactor={1.0}
          // Nudge slightly outward so it doesn't z-fight with glass
          position={[0, 0, 0.002]}
        >
          <div
            style={{
              width: 320,
              height: 690,
              borderRadius: 22,
              overflow: "hidden",
              // helps click accuracy
              pointerEvents: "auto",
            }}
          >
            <PhoneDemoUI />
          </div>
        </Html>
      </group>
    </group>
  );
}

// Preload the model
useGLTF.preload("/models/scandish.glb");
