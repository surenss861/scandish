import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import IPhoneModel from "./IPhoneModel.jsx";
import * as THREE from "three";

// HUGE visible test mesh
function TestMesh() {
  return (
    <>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 4, 0.2]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
      </mesh>
      <mesh position={[2, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1} />
      </mesh>
    </>
  );
}

export default function HeroShowcase3D() {
  const [canvasReady, setCanvasReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🚀 HeroShowcase3D component mounted");
  }, []);

  console.log("✅ FORCING 3D RENDER - NO RESTRICTIONS");

  return (
    <div 
      className="absolute inset-0 -z-10" 
      style={{ 
        backgroundColor: 'rgba(255, 0, 0, 0.1)', // Red tint to see canvas area
        border: '4px solid #00ff00', // Bright green border
        minHeight: '500px',
        minWidth: '500px'
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance", 
          alpha: false, // Opaque background
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
          setError(error.message);
        }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* ALWAYS VISIBLE TEST MESHES */}
        <TestMesh />

        <Suspense 
          fallback={
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#0000ff" emissive="#0000ff" emissiveIntensity={1} />
            </mesh>
          }
        >
          <IPhoneModel />
        </Suspense>
      </Canvas>
      
      {/* Debug overlay - ALWAYS VISIBLE */}
      <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded text-sm font-bold z-[9999]">
        Canvas: {canvasReady ? "READY ✓" : "LOADING..."}
        {error && <div className="text-xs mt-1">Error: {error}</div>}
      </div>
    </div>
  );
}
