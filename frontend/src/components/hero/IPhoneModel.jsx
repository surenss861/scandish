import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import PhoneDemoUI from "./PhoneDemoUI.jsx";

export default function IPhoneModel({ url = "/models/scandish.glb", onLoaded }) {
  const group = useRef(null);
  const screenMeshRef = useRef(null);
  const screenAnchorRef = useRef(null);
  
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
    const targetHeight = 1.15; // was 1.6 — too big for your wide panel
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
            screenMeshRef.current = obj; // Store reference for Html anchor
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
            screenMeshRef.current = obj; // Store reference for Html anchor
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
  }, [scene]);

  // Keep anchor glued to screen mesh
  useFrame(() => {
    const screen = screenMeshRef.current;
    const anchor = screenAnchorRef.current;
    if (!screen || !anchor) return;

    screen.updateWorldMatrix(true, false);
    anchor.matrix.copy(screen.matrixWorld);
    anchor.matrix.decompose(anchor.position, anchor.quaternion, anchor.scale);
  });

  // Animation for phone float
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.35) * 0.25;
    group.current.rotation.x = Math.sin(t * 0.22) * 0.05;
  });

  // Auto-fitted model - premium product hero angle
  if (!scene) return null;
  
  return (
    <group
      ref={group}
      position={[0.45, -0.15, 0]}     // push into right side of card
      rotation={[0.05, -0.55, 0.02]} // premium angle
      scale={1}
    >
      <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.25}>
        <primitive object={scene} />
        
        {/* Screen anchor (follows the screen mesh) */}
        <group ref={screenAnchorRef}>
          <Html
            transform
            occlude
            style={{ pointerEvents: "auto" }}
            distanceFactor={1.05}
            position={[0, 0, 0.002]}   // slightly above screen to avoid z-fighting
          >
            {/* size matches a phone-ish viewport */}
            <div style={{ width: 330, height: 720 }}>
              <PhoneDemoUI />
            </div>
          </Html>
        </group>
      </Float>
    </group>
  );
}

// Preload the model
useGLTF.preload("/models/scandish.glb");
