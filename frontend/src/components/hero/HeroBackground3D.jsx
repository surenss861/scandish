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
      camera={{ position: [0.15, 0.05, 2.75], fov: 28 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      shadows
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 2, 2]} intensity={1.35} />
      <pointLight position={[-2, 1, 2]} intensity={0.55} />

      <Environment preset="studio" />

      {/* Phone positioned better in composition */}
      <Suspense fallback={null}>
        <Float speed={1.05} rotationIntensity={0.18} floatIntensity={0.22}>
          <group
            position={[0.75, -0.06, 0]}
            rotation={[0.08, -0.42, 0.02]}
          >
            <IPhoneModel heroScale={2.45} />
          </group>
        </Float>
      </Suspense>
    </Canvas>
  );
}

