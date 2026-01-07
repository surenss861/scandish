import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";

export default function IPhoneModel({ url = "/models/iphone17-pro.glb" }) {
  const group = useRef(null);
  const { scene } = useGLTF(url);

  // Make materials look premium
  scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
      if (obj.material) {
        obj.material.metalness = Math.min(0.9, obj.material.metalness ?? 0.4);
        obj.material.roughness = Math.max(0.2, obj.material.roughness ?? 0.35);
      }
    }
  });

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

