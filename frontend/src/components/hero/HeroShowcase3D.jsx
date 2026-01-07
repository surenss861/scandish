import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import IPhoneModel from "./IPhoneModel.jsx";

export default function HeroShowcase3D({ className = "" }) {
  return (
    <div className={`w-full h-full pointer-events-auto ${className}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0.2, 0.05, 2.35], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.setClearColor(0x000000, 0);
        }}
        shadows
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 4, 2]} intensity={1.25} castShadow />
        <pointLight position={[-3, -2, 3]} intensity={0.6} color="#1E7A4A" />

        <Suspense fallback={null}>
          <IPhoneModel />
        </Suspense>

        <ContactShadows
          position={[0, -1.15, 0]}
          opacity={0.32}
          blur={2.4}
          scale={8}
        />
      </Canvas>
    </div>
  );
}
