import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import QrPreview from "./QrPreview.jsx";

export default function Hero() {
  const [draggedItem, setDraggedItem] = useState(null);

  const demoItems = [
    { id: 1, name: "Margherita Pizza", price: "$16.99", category: "Pizza" },
    { id: 2, name: "Caesar Salad", price: "$12.99", category: "Salads" },
    { id: 3, name: "Pasta Carbonara", price: "$18.99", category: "Pasta" },
  ];

  return (
    <section className="px-6 md:px-12 lg:px-24 py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
              Instant QR menus that{" "}
              <span className="text-[#F3C77E]">update in seconds</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              No PDFs. No designers. Edit once — your QR stays the same.
            </p>

            {/* Value Props */}
            <div className="space-y-3 mb-8">
              {[
                "Update prices in 10 seconds",
                "Sell more with photos + specials",
                "Stop dealing with PDFs forever",
              ].map((prop, idx) => (
                <div key={idx} className="flex items-center gap-3 text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F3C77E]" />
                  <span>{prop}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Link
                to="/login"
                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                Start Free
              </Link>
              <Link
                to="/menu/demo"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-colors"
              >
                View Demo Menu
              </Link>
            </div>

            {/* Trust Line */}
            <p className="text-sm text-gray-500">
              Free plan • Cancel anytime • Takes 3 minutes
            </p>
          </motion.div>

          {/* Right: Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Phone Frame with Menu Preview */}
            <div className="relative bg-white border-2 border-gray-200 rounded-[2rem] p-4 shadow-2xl">
              <div className="bg-gray-50 rounded-[1.5rem] overflow-hidden">
                {/* Phone Header */}
                <div className="bg-white border-b border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Demo Restaurant</h3>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-gray-400" />
                      <div className="w-1 h-1 rounded-full bg-gray-400" />
                      <div className="w-1 h-1 rounded-full bg-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Menu Content */}
                <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Pizza
                    </h4>
                    {demoItems.map((item) => (
                      <motion.div
                        key={item.id}
                        className="bg-white border border-gray-200 rounded-xl p-3 cursor-move"
                        draggable
                        onDragStart={() => setDraggedItem(item)}
                        onDragEnd={() => setDraggedItem(null)}
                        whileHover={{ scale: 1.02 }}
                        whileDrag={{ scale: 1.05, opacity: 0.8 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {item.name}
                          </span>
                          <span className="text-[#F3C77E] font-semibold">
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
            <div className="absolute -bottom-8 -right-8 bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-xl">
              <QrPreview url="https://scandish.ca/menu/demo" size={120} />
              <p className="text-xs text-center text-gray-600 mt-2 font-medium">
                Scan to view
              </p>
            </div>

            {/* Live Editor Indicator */}
            {draggedItem && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 left-4 bg-[#F3C77E] text-gray-900 px-4 py-2 rounded-lg shadow-lg font-semibold text-sm"
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
