import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import QrPreview from "./QrPreview.jsx";
import HeroShowcase3D from "./hero/HeroShowcase3D.jsx";
import { useHeroParallax } from "../hooks/useHeroParallax.js";

export default function Hero() {
  const [draggedItem, setDraggedItem] = useState(null);
  const parallaxRef = useHeroParallax();

  const demoItems = [
    { id: 1, name: "Margherita Pizza", price: "$16.99", category: "Pizza" },
    { id: 2, name: "Caesar Salad", price: "$12.99", category: "Salads" },
    { id: 3, name: "Pasta Carbonara", price: "$18.99", category: "Pasta" },
  ];

  return (
    <section
      ref={parallaxRef}
      className="relative px-6 md:px-12 lg:px-24 py-20 md:py-32 bg-[#0B0F0E] overflow-hidden"
    >
      {/* 3D iPhone Model */}
      <HeroShowcase3D />

      {/* Green/Black Tint Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B0F0E]/55 via-[#0B0F0E]/35 to-[#0B0F0E]/70 z-0" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[#1E7A4A]/10 blur-[120px] z-0" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            data-parallax
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
                  className="flex items-center gap-3 text-[#A6B0AA]"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1E7A4A]" />
                  <span>{prop}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Link
                to="/login"
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

            {/* Trust Line */}
            <p className="text-sm text-[#A6B0AA]">
              Free plan • Cancel anytime • Takes 3 minutes
            </p>
          </motion.div>

          {/* Right: Interactive Demo (Desktop) or 3D iPhone placeholder (Mobile) */}
          <motion.div
            data-parallax
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* On mobile, show a simple placeholder since 3D is disabled */}
            <div className="lg:hidden flex items-center justify-center h-[400px]">
              <div className="text-center">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-[#A6B0AA]">View on desktop for 3D preview</p>
              </div>
            </div>
            
            {/* Phone Frame with Menu Preview (Desktop only) */}
            <div className="relative hidden lg:block bg-[#101614] border-2 border-[#1B2420] rounded-[2rem] p-4 shadow-2xl">
              <div className="bg-[#0B0F0E] rounded-[1.5rem] overflow-hidden">
                {/* Phone Header */}
                <div className="bg-[#101614] border-b border-[#1B2420] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#F3F5F4]">
                      Demo Restaurant
                    </h3>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-[#A6B0AA]" />
                      <div className="w-1 h-1 rounded-full bg-[#A6B0AA]" />
                      <div className="w-1 h-1 rounded-full bg-[#A6B0AA]" />
                    </div>
                  </div>
                </div>

                {/* Menu Content */}
                <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-[#A6B0AA] uppercase tracking-wide">
                      Pizza
                    </h4>
                    {demoItems.map((item) => (
                      <motion.div
                        key={item.id}
                        className="bg-[#101614] border border-[#1B2420] rounded-xl p-3 cursor-move"
                        draggable
                        onDragStart={() => setDraggedItem(item)}
                        onDragEnd={() => setDraggedItem(null)}
                        whileHover={{ scale: 1.02, borderColor: "#1E7A4A" }}
                        whileDrag={{ scale: 1.05, opacity: 0.8 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#F3F5F4]">
                            {item.name}
                          </span>
                          <span className="text-[#1E7A4A] font-semibold">
                            {item.price}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="absolute -bottom-8 -right-8 bg-[#101614] border-2 border-[#1B2420] rounded-2xl p-4 shadow-xl">
              <QrPreview url="https://scandish.ca/menu/demo" size={120} />
              <p className="text-xs text-center text-[#A6B0AA] mt-2 font-medium">
                Scan to view
              </p>
            </div>

            {/* Live Editor Indicator */}
            {draggedItem && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 left-4 bg-[#1E7A4A] text-[#F3F5F4] px-4 py-2 rounded-lg shadow-lg font-semibold text-sm"
              >
                ✨ Live Editor
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
