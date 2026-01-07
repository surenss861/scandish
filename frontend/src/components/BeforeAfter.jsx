import React from "react";
import { motion } from "framer-motion";

export default function BeforeAfter() {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            PDF Menus vs. Scandish
          </h2>
          <p className="text-xl text-gray-600">
            See the difference that matters to your customers
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Before: PDF */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">❌</span>
              <h3 className="text-2xl font-bold text-gray-900">PDF QR Menu</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">×</span>
                <span>Slow load, pinching & zooming required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">×</span>
                <span>Can't search or filter items</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">×</span>
                <span>No analytics or insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">×</span>
                <span>Must reprint QR when menu changes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">×</span>
                <span>Ugly, dated design</span>
              </li>
            </ul>
          </motion.div>

          {/* After: Scandish */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-green-50 border-2 border-green-200 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">✅</span>
              <h3 className="text-2xl font-bold text-gray-900">Scandish</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Ultra-fast load, optimized for mobile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Search bar + dietary filters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Analytics: top items, engagement, revenue insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>QR stays same, menu updates instantly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Premium design, customizable branding</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

