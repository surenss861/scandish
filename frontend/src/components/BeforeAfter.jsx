import React from "react";
import { motion } from "framer-motion";
import { useBentoReveal } from "../hooks/useBentoReveal.js";

export default function BeforeAfter() {
  const ref = useBentoReveal();

  return (
    <section
      ref={ref}
      className="px-6 md:px-12 lg:px-24 py-20 bg-[#101614]"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          data-reveal
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#F3F5F4] mb-4">
            PDF Menus vs. Scandish
          </h2>
          <p className="text-xl text-[#A6B0AA]">
            See the difference that matters to your customers
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Before: PDF */}
          <motion.div
            data-reveal
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#0B0F0E] border-2 border-[#1B2420] rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">❌</span>
              <h3 className="text-2xl font-bold text-[#F3F5F4]">PDF QR Menu</h3>
            </div>
            <ul className="space-y-3 text-[#A6B0AA]">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">×</span>
                <span>Slow load, pinching & zooming required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">×</span>
                <span>Can't search or filter items</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">×</span>
                <span>No analytics or insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">×</span>
                <span>Must reprint QR when menu changes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">×</span>
                <span>Ugly, dated design</span>
              </li>
            </ul>
          </motion.div>

          {/* After: Scandish */}
          <motion.div
            data-reveal
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#0B0F0E] border-2 border-[#1E7A4A] rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">✅</span>
              <h3 className="text-2xl font-bold text-[#F3F5F4]">Scandish</h3>
            </div>
            <ul className="space-y-3 text-[#A6B0AA]">
              <li className="flex items-start gap-2">
                <span className="text-[#1E7A4A] mt-1">✓</span>
                <span>Ultra-fast load, optimized for mobile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1E7A4A] mt-1">✓</span>
                <span>Search bar + dietary filters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1E7A4A] mt-1">✓</span>
                <span>Analytics: top items, engagement, revenue insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1E7A4A] mt-1">✓</span>
                <span>QR stays same, menu updates instantly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1E7A4A] mt-1">✓</span>
                <span>Premium design, customizable branding</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
