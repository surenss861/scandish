import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import IPhoneModel from "./IPhoneModel.jsx";

export default function HeroShowcase3D() {
  const [canvasReady, setCanvasReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Don't render on mobile
  if (isMobile) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.05, 1.6], fov: 35 }}
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance", 
          alpha: true
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

        <Suspense fallback={null}>
          <IPhoneModel onLoaded={() => setModelReady(true)} />
        </Suspense>

        <ContactShadows
          position={[0, -1.15, 0]}
          opacity={0.35}
          blur={2.2}
          scale={8}
        />
      </Canvas>

      {import.meta.env.DEV && canvasReady && (
        <div className="absolute top-4 left-4 bg-[#1E7A4A] text-[#F3F5F4] px-3 py-1 rounded text-xs font-bold z-[9999]">
          Canvas: READY {modelReady ? "| Model: READY" : "| Model: LOADING..."}
        </div>
      )}
    </div>
  );
}
