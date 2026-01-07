import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

export default function PhoneCallout() {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Subtle float animation
    groupRef.current.position.y = 0.3 + Math.sin(t * 0.8) * 0.03;
  });

  return (
    <group ref={groupRef} position={[0.5, 0.3, 0]}>
      {/* Background card */}
      <mesh>
        <roundedBoxGeometry args={[0.65, 0.18, 0.01, 8, 0.02]} />
        <meshBasicMaterial 
          color="#101614" 
          transparent 
          opacity={0.9}
        />
      </mesh>
      
      {/* Text */}
      <Text
        position={[0, 0, 0.02]}
        fontSize={0.04}
        color="#F3F5F4"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        Edit price → updates live
      </Text>
      <Text
        position={[0, -0.05, 0.02]}
        fontSize={0.028}
        color="#A6B0AA"
        anchorX="center"
        anchorY="middle"
      >
        QR unchanged
      </Text>
    </group>
  );
}

