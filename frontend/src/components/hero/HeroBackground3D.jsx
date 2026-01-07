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
      camera={{ position: [0, 0.1, 2.2], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      shadows
    >
      {/* lighting that makes it visible even as background */}
      <ambientLight intensity={1.0} />
      <directionalLight position={[2, 2, 2]} intensity={1.4} />
      <pointLight position={[-2, 1, 2]} intensity={0.6} />

      <Environment preset="studio" />

      {/* BIG phone, right side */}
      <Suspense fallback={null}>
        <Float speed={1.1} rotationIntensity={0.22} floatIntensity={0.25}>
          <group position={[1.15, -0.05, 0]} rotation={[0.08, -0.62, 0.03]}>
            <IPhoneModel heroScale={2.6} />
          </group>
        </Float>
      </Suspense>
    </Canvas>
  );
}

