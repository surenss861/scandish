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
      setIsMobile(window.innerWidth < 1024); // Hide on tablets too
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
    <div 
      className="absolute inset-0 -z-10 pointer-events-none"
    >
      {/* Position canvas on right side of hero */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full flex items-center justify-center">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 60 }}
          gl={{ 
            antialias: true, 
            powerPreference: "high-performance", 
            alpha: true,
            preserveDrawingBuffer: true
          }}
          shadows={false}
          onCreated={(state) => {
            console.log("🎨 Canvas created successfully!", state);
            console.log("📐 Canvas size:", state.size);
            setCanvasReady(true);
          }}
          onError={(error) => {
            console.error("❌ Canvas error:", error);
          }}
        >
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={2} />
          <pointLight position={[-5, 5, 5]} intensity={1} />
          <pointLight position={[0, -5, 5]} intensity={0.5} color="#1E7A4A" />

          <Suspense 
            fallback={null}
          >
            <IPhoneModel onLoaded={() => setModelReady(true)} />
          </Suspense>

          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.4}
            blur={2}
            scale={15}
          />
        </Canvas>
      </div>
      
      {/* Debug overlay - only in dev */}
      {import.meta.env.DEV && canvasReady && (
        <div className="absolute top-4 right-4 bg-[#1E7A4A] text-[#F3F5F4] px-3 py-1 rounded text-xs font-bold z-[9999] pointer-events-auto">
          Canvas: {canvasReady ? "READY" : "LOADING"} {modelReady ? "| Model: READY" : "| Model: LOADING..."}
        </div>
      )}
    </div>
  );
}
