import { Suspense, useMemo, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import IPhoneModel from "./IPhoneModel.jsx";

function useReducedMotion() {
  return useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
}

export default function HeroShowcase3D() {
  const reduced = useReducedMotion();
  const [shouldRender, setShouldRender] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Lazy load - only render after a short delay
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 300);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Fallback skeleton
  if (reduced || isMobile || !shouldRender) {
    return (
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-64 h-96 bg-[#101614] border border-[#1B2420] rounded-3xl opacity-20" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.2, 3.2], fov: 40 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        shadows
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow />

        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1, 2, 0.1]} />
            <meshStandardMaterial color="#1E7A4A" opacity={0.2} transparent />
          </mesh>
        }>
          <IPhoneModel />
        </Suspense>

        <ContactShadows
          position={[0, -1.15, 0]}
          opacity={0.35}
          blur={2.2}
          scale={8}
        />
      </Canvas>
    </div>
  );
}

