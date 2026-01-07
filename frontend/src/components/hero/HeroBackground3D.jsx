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

      {/* Phone: BIG, centered-left, face-on, hero product */}
      <Suspense fallback={null}>
        {/* Stage spotlight pocket behind phone (tight radial glow) */}
        <pointLight 
          position={[0.55, 0.15, 1.2]} 
          intensity={1.5} 
          color="#1E7A4A"
          distance={2.5}
          decay={2}
        />
        
        {/* Vignette around stage pocket */}
        <mesh position={[0.55, 0.15, 0.5]} rotation={[0, 0, 0]}>
          <ringGeometry args={[1.8, 3.5, 32]} />
          <meshBasicMaterial 
            color="#000000" 
            transparent 
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        <Float speed={1.05} rotationIntensity={0.18} floatIntensity={0.22}>
          <group
            position={[0.55, 0.12, 0]}  // Moved left ~15%, raised to "update in seconds" line
            rotation={[0.04, -0.22, 0.01]}  // Less yaw, more face-on (was -0.28)
          >
            <IPhoneModel heroScale={3.5} />  // Bigger - visually competes with headline
          </group>
        </Float>
        
        {/* Soft occlusion shadow under phone (grounded) */}
        <mesh position={[0.55, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial 
            color="#000000" 
            transparent 
            opacity={0.25}
          />
        </mesh>
        
        {/* Small elegant callout label near phone edge */}
        <group position={[0.25, 0.25, 0]}>
          <mesh>
            <planeGeometry args={[0.5, 0.12]} />
            <meshBasicMaterial 
              color="#101614" 
              transparent 
              opacity={0.85}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.035}
            color="#F3F5F4"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.45}
          >
            Edit → Live
          </Text>
          <Text
            position={[0, -0.04, 0.01]}
            fontSize={0.025}
            color="#A6B0AA"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.45}
          >
            QR unchanged
          </Text>
          {/* Subtle dot anchor */}
          <mesh position={[0.28, 0, 0.01]}>
            <circleGeometry args={[0.008, 16]} />
            <meshBasicMaterial color="#1E7A4A" />
          </mesh>
        </group>
      </Suspense>
    </Canvas>
  );
}

