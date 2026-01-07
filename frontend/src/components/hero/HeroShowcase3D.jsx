import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import IPhoneModel from "./IPhoneModel.jsx";

export default function HeroShowcase3D({ className = "" }) {
  const [canvasReady, setCanvasReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    console.log("🚀 HeroShowcase3D component mounted");
  }, []);

  return (
    <div className={`w-full h-full pointer-events-auto ${className}`}>
      <Canvas
        style={{ touchAction: "none" }}
        dpr={[1, 1.75]}
        camera={{ position: [0.0, 0.05, 2.25], fov: 38 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true
        }}
        shadows
        onCreated={() => {
          console.log("🎨 Canvas created successfully!");
          setCanvasReady(true);
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 2]} intensity={1.1} castShadow />
        <pointLight position={[-3, -2, 3]} intensity={0.45} color="#1E7A4A" />

        <Suspense fallback={null}>
          <IPhoneModel onLoaded={() => setModelReady(true)} />
        </Suspense>

        <ContactShadows
          position={[0, -1.15, 0]}
          opacity={0.32}
          blur={2.4}
          scale={8}
        />
      </Canvas>

      {import.meta.env.DEV && canvasReady && (
        <div className="absolute top-4 left-4 bg-[#1E7A4A] text-[#F3F5F4] px-3 py-1 rounded text-xs font-bold z-[9999] pointer-events-none">
          Canvas: {canvasReady ? "READY" : "LOADING"}{" "}
          {modelReady ? "| Model: READY" : "| Model: LOADING..."}
        </div>
      )}
    </div>
  );
}
