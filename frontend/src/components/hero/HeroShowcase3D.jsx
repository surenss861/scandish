import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import IPhoneModel from "./IPhoneModel.jsx";

export default function HeroShowcase3D() {
  const [canvasReady, setCanvasReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    console.log("🚀 HeroShowcase3D component mounted");
  }, []);

  return (
    <div
      className="absolute inset-0 -z-10 pointer-events-none"
      style={{
        minHeight: '500px',
        minWidth: '500px'
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.2, 3.2], fov: 40 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
          preserveDrawingBuffer: true
        }}
        shadows
        onCreated={(state) => {
          console.log("🎨 Canvas created successfully!", state);
          setCanvasReady(true);
        }}
        onError={(error) => {
          console.error("❌ Canvas error:", error);
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow />
        <pointLight position={[-3, -3, 3]} intensity={0.5} color="#1E7A4A" />

        <Suspense
          fallback={null}
        >
          <IPhoneModel onLoaded={() => setModelReady(true)} />
        </Suspense>

        <ContactShadows
          position={[0, -1.15, 0]}
          opacity={0.35}
          blur={2.2}
          scale={8}
        />
      </Canvas>

      {/* Debug overlay - only in dev */}
      {import.meta.env.DEV && canvasReady && (
        <div className="absolute top-4 left-4 bg-[#1E7A4A] text-[#F3F5F4] px-3 py-1 rounded text-xs font-bold z-[9999] pointer-events-auto">
          Canvas: {canvasReady ? "READY" : "LOADING"} {modelReady ? "| Model: READY" : "| Model: LOADING..."}
        </div>
      )}
    </div>
  );
}
