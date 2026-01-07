import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import IPhoneModel from "./IPhoneModel.jsx";
import * as THREE from "three";

// Simple test mesh to verify canvas is working
function TestMesh() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 2, 0.1]} />
      <meshStandardMaterial color="#1E7A4A" emissive="#1E7A4A" emissiveIntensity={0.8} />
    </mesh>
  );
}

export default function HeroShowcase3D() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      console.log("📱 Mobile check:", mobile, "Width:", window.innerWidth);
    };
    
    const checkReduced = () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setReduced(reducedMotion);
      console.log("🎬 Reduced motion:", reducedMotion);
    };

    checkMobile();
    checkReduced();
    window.addEventListener("resize", checkMobile);

    // Lazy load - only render after a short delay
    const timer = setTimeout(() => {
      setShouldRender(true);
      console.log("🎨 3D Hero should render:", { 
        reduced, 
        isMobile, 
        shouldRender: true,
        willRender: !reduced && !isMobile && true
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, [reduced, isMobile]);

  // FORCE RENDER FOR DEBUGGING - Remove restrictions
  const forceRender = true;

  if (!forceRender && (reduced || isMobile || !shouldRender)) {
    console.log("⏸️ 3D Hero blocked:", { reduced, isMobile, shouldRender });
    return (
      <div className="absolute inset-0 -z-10 flex items-center justify-center bg-red-500/20">
        <div className="w-64 h-96 bg-[#101614] border-2 border-[#1E7A4A] rounded-3xl opacity-50">
          <div className="p-4 text-center text-[#F3F5F4]">
            <p className="text-sm font-bold">3D DISABLED</p>
            <p className="text-xs text-[#A6B0AA] mt-2">
              Mobile: {isMobile ? "Yes" : "No"}<br/>
              Reduced: {reduced ? "Yes" : "No"}<br/>
              Ready: {shouldRender ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log("✅ Rendering 3D Canvas - FORCED ON");

  return (
    <div 
      className="absolute inset-0 -z-10" 
      style={{ 
        backgroundColor: 'rgba(11, 15, 14, 0.3)',
        border: '2px solid rgba(30, 122, 74, 0.5)' // Green border to see canvas area
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

        {/* Test mesh - should always be visible */}
        <TestMesh />

        <Suspense 
          fallback={
            <mesh position={[0, 1, 0]}>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
            </mesh>
          }
        >
          <IPhoneModel />
        </Suspense>

        <ContactShadows
          position={[0, -1.15, 0]}
          opacity={0.35}
          blur={2.2}
          scale={8}
        />
      </Canvas>
      
      {/* Debug overlay */}
      {canvasReady && (
        <div className="absolute top-4 left-4 bg-[#1E7A4A] text-[#F3F5F4] px-3 py-1 rounded text-xs font-bold z-50">
          Canvas Ready ✓
        </div>
      )}
    </div>
  );
}
