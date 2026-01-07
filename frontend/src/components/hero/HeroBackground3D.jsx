import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Float, Text } from "@react-three/drei";
import * as THREE from "three";
import IPhoneModel from "./IPhoneModel.jsx";

export default function HeroBackground3D() {
  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 1.5]}
      camera={{ position: [0.15, 0.12, 2.75], fov: 28 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      shadows
    >
      <ambientLight intensity={1.0} />
      <directionalLight position={[2, 2, 2]} intensity={1.5} castShadow />
      <pointLight position={[-2, 1, 2]} intensity={0.6} />
      
      {/* Stronger, tighter rim light on right edge + top edge */}
      <pointLight position={[3.5, 1.2, 0.8]} intensity={1.2} color="#1E7A4A" />
      <pointLight position={[2.8, 2.5, 0.5]} intensity={0.9} color="#2AAE67" />
      
      {/* Stage spotlight behind phone (not centered) */}
      <spotLight
        position={[1.8, 0.3, 1.5]}
        angle={0.35}
        penumbra={0.6}
        intensity={0.8}
        color="#1E7A4A"
        castShadow={false}
        target-position={[0.85, 0.05, 0]}
      />

      <Environment preset="studio" />

      {/* Phone: BIG, right-anchored, raised, screen-facing */}
      <Suspense fallback={null}>
        <Float speed={1.05} rotationIntensity={0.18} floatIntensity={0.22}>
          <group
            position={[0.85, 0.08, 0]}  // Further right, raised to align with headline top third
            rotation={[0.05, -0.28, 0.015]}  // More screen-facing, slight premium roll
          >
            <IPhoneModel heroScale={3.0} />  // 20-35% bigger (was 2.45, now 3.0)
          </group>
        </Float>
        
        {/* Soft shadow/occlusion under phone */}
        <mesh position={[0.85, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 1.2]} />
          <meshBasicMaterial 
            color="#000000" 
            transparent 
            opacity={0.15}
          />
        </mesh>
        
        {/* Floating callout near phone */}
        <group position={[0.5, 0.3, 0]}>
          <mesh>
            <planeGeometry args={[0.65, 0.18]} />
            <meshBasicMaterial 
              color="#101614" 
              transparent 
              opacity={0.9}
            />
          </mesh>
          <Text
            position={[0, 0.02, 0.01]}
            fontSize={0.045}
            color="#F3F5F4"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.6}
          >
            Edit price → updates live
          </Text>
          <Text
            position={[0, -0.03, 0.01]}
            fontSize={0.032}
            color="#A6B0AA"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.6}
          >
            QR unchanged
          </Text>
        </group>
      </Suspense>
    </Canvas>
  );
}

