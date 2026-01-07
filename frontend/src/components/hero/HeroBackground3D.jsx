import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import IPhoneModel from "./IPhoneModel.jsx";

export default function HeroBackground3D() {
  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 1.75]}
      camera={{ position: [0.0, 0.1, 2.25], fov: 24 }} // ✅ tighter + closer = BIG phone
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.NoToneMapping; // ✅ keep whites WHITE (screen)
      }}
    >
      {/* --- Lighting rig: Apple-style product shot --- */}
      {/* Soft base ambience (keep low to let lights shape the model) */}
      <ambientLight intensity={0.55} />

      {/* Key light (front-left, soft) */}
      <directionalLight
        position={[-2.2, 1.6, 2.4]}
        intensity={1.25}
        castShadow={false}
      />

      {/* Fill light (front-right, very soft) */}
      <pointLight position={[1.9, 0.6, 2.2]} intensity={0.55} />

      {/* Rim light (right edge highlight) */}
      <pointLight
        position={[2.4, 0.7, 0.3]}
        intensity={1.3}
        color="#2AAE67"
        distance={6}
        decay={2}
      />

      {/* Back glow pocket behind phone (stage glow) */}
      <pointLight
        position={[0.8, 0.0, -0.25]}
        intensity={1.4}
        color="#1E7A4A"
        distance={4}
        decay={2}
      />

      <Environment preset="studio" />

      <Suspense fallback={null}>
        {/* --- Phone group --- */}
        <Float speed={0.9} rotationIntensity={0.12} floatIntensity={0.12}>
          <group
            // ✅ "hero-right" placement while still centered in composition
            position={[0.82, -0.02, 0]}
            rotation={[0.02, -0.38, 0.01]}
          >
            {/* Screen glow card behind phone (makes display feel lit) */}
            <mesh position={[0.06, 0.07, -0.06]}>
              <planeGeometry args={[1.15, 2.4]} />
              <meshBasicMaterial
                color="#1E7A4A"
                transparent
                opacity={0.10}
                depthWrite={false}
              />
            </mesh>

            {/* Stronger inner glow (smaller + brighter) */}
            <mesh position={[0.04, 0.08, -0.05]}>
              <planeGeometry args={[0.78, 1.8]} />
              <meshBasicMaterial
                color="#2AAE67"
                transparent
                opacity={0.10}
                depthWrite={false}
              />
            </mesh>

            {/* ✅ BIG phone */}
            <IPhoneModel heroScale={5.25} />
          </group>
        </Float>

        {/* Soft ground shadow (subtle, not obvious) */}
        <mesh position={[0.78, -0.62, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.55, 48]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.22} />
        </mesh>
      </Suspense>
    </Canvas>
  );
}
