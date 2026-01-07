import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import IPhoneModel from "./IPhoneModel.jsx";

export default function HeroShowcase3D({ className = "" }) {
  return (
    <div className={`w-full h-full pointer-events-auto ${className}`}>
      <Canvas
        style={{ touchAction: "none" }}
        dpr={[1, 1.75]}
        camera={{ position: [0.15, 0.02, 2.05], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 2]} intensity={1.25} />
        <pointLight position={[-3, -3, 3]} intensity={0.55} color="#1E7A4A" />

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
