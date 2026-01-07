import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import HeroShowcase3D from "./hero/HeroShowcase3D.jsx";
import { useHeroPin } from "../hooks/useHeroPin.js";

export default function Hero() {
  const pinRef = useHeroPin();

  return (
    <section
      ref={pinRef}
      className="relative px-6 md:px-12 lg:px-24 py-20 md:py-32 bg-[#0B0F0E] overflow-hidden min-h-screen"
    >
      {/* 3D iPhone Background Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <HeroShowcase3D />
      </div>

      {/* Green/Black Tint Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B0F0E]/55 via-[#0B0F0E]/35 to-[#0B0F0E]/70 z-0" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[#1E7A4A]/10 blur-[120px] z-0" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm text-[#1E7A4A]/90 mb-2 font-medium">
              Scandish • QR Menus
            </p>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-[#F3F5F4]">
              Instant QR menus that{" "}
              <span className="text-[#1E7A4A]">update in seconds</span>
            </h1>
            <p className="text-xl text-[#A6B0AA] mb-8 leading-relaxed">
              Replace PDF menus with a clean mobile experience. Edit anytime —
              your QR code stays the same.
            </p>

            {/* Value Props */}
            <div className="space-y-3 mb-8">
              {[
                "Update prices in 10 seconds",
                "Sell more with photos + specials",
                "Stop dealing with PDFs forever",
              ].map((prop, idx) => (
                <div
                  key={idx}
                  data-value-prop
                  className="flex items-center gap-3 text-[#A6B0AA]"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1E7A4A]" />
                  <span>{prop}</span>
                </div>
              ))}
            </div>

            {/* Proof Chip */}
            <div className="mb-6 inline-flex items-center gap-2 bg-[#101614] border border-[#1B2420] rounded-full px-4 py-2">
              <span className="text-[#1E7A4A] font-semibold">73+</span>
              <span className="text-sm text-[#A6B0AA]">restaurants in Toronto</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-4">
              <Link
                to="/login"
                data-cta-pulse
                className="px-6 py-3 bg-[#1E7A4A] text-[#F3F5F4] rounded-xl font-semibold hover:bg-[#2AAE67] transition-colors"
              >
                Start Free
              </Link>
              <Link
                to="/menu/demo"
                className="px-6 py-3 border border-[#1B2420] text-[#A6B0AA] rounded-xl font-semibold hover:border-[#1E7A4A] hover:text-[#F3F5F4] transition-colors"
              >
                View Demo Menu
              </Link>
            </div>

            {/* Micro-Trust Lines */}
            <div className="space-y-1 mb-4">
              <p className="text-sm text-[#A6B0AA]">
                ✓ Free plan • Cancel anytime
              </p>
              <p className="text-sm text-[#A6B0AA]">
                ✓ Takes 3 minutes to launch
              </p>
            </div>
          </motion.div>

          {/* Right: Empty - iPhone is now in background */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Placeholder for future content or keep empty */}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
