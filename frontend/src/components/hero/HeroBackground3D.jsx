import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import IPhoneModel from "./IPhoneModel.jsx";

export default function HeroBackground3D() {
  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 1.5]}
      camera={{ position: [0.15, 0.08, 2.75], fov: 28 }}
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
      
      {/* Rim light behind/right for silhouette */}
      <pointLight position={[3, 0.5, 1]} intensity={0.8} color="#1E7A4A" />
      
      {/* Stage glow spotlight behind phone */}
      <spotLight
        position={[1.5, 0.5, 2]}
        angle={0.4}
        penumbra={0.5}
        intensity={0.6}
        color="#1E7A4A"
        castShadow={false}
      />

      <Environment preset="studio" />

      {/* Phone in hero composition position - more inward, raised, screen-facing */}
      <Suspense fallback={null}>
        <Float speed={1.05} rotationIntensity={0.18} floatIntensity={0.22}>
          <group
            position={[0.55, 0.02, 0]}  // 15-25% inward from right, raised to headline level
            rotation={[0.06, -0.32, 0.02]}  // Less yaw rotation, shows more screen face
          >
            <IPhoneModel heroScale={2.45} />
          </group>
        </Float>
      </Suspense>
    </Canvas>
  );
}

