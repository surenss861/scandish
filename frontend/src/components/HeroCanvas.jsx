import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";

function QRPlane() {
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[2, 2, 32, 32]} />
        <meshStandardMaterial
          color="#1E7A4A"
          metalness={0.2}
          roughness={0.4}
          transparent
          opacity={0.15}
        />
      </mesh>
    </Float>
  );
}

function ScanRing() {
  return (
    <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.08, 24, 100]} />
        <meshStandardMaterial
          color="#1E7A4A"
          metalness={0.4}
          roughness={0.3}
          emissive="#1E7A4A"
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

function ScanParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 2,
    ],
    size: Math.random() * 0.05 + 0.02,
  }));

  return (
    <>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshStandardMaterial
            color="#2AAE67"
            emissive="#1E7A4A"
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </>
  );
}

function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 3, 3]} intensity={0.8} />
      <pointLight position={[-3, -3, 3]} intensity={0.3} color="#1E7A4A" />
      <QRPlane />
      <ScanRing />
      <ScanParticles />
    </>
  );
}

export function HeroCanvas() {
  const [shouldRender, setShouldRender] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);

    // Lazy load - only render after a short delay or when visible
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Don't render on mobile or if reduced motion
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  if (prefersReduced || isMobile || !shouldRender) return null;

  return (
    <div className="absolute inset-0 -z-10 opacity-30">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      >
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </Canvas>
      {/* Green tint overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-[#1E7A4A]/10 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

