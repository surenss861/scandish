import React from "react";
import { motion } from "framer-motion";
import { Search, BarChart3, Palette, Users, QrCode, Image as ImageIcon, TrendingUp, Download } from "lucide-react";
import { useBentoReveal } from "../hooks/useBentoReveal.js";
import QrPreview from "./QrPreview.jsx";

const features = [
  {
    title: "Drag & Drop Editor",
    description: "Reorder items instantly. No coding required.",
    icon: "🎯",
    size: "big",
    uiSnippet: (
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#A6B0AA]">
          <div className="w-2 h-2 rounded bg-[#1E7A4A]" />
          <span>Margherita Pizza</span>
          <span className="ml-auto text-[#1E7A4A]">$16.99</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#A6B0AA] opacity-60">
          <div className="w-2 h-2 rounded bg-[#1B2420]" />
          <span>Caesar Salad</span>
          <span className="ml-auto">$12.99</span>
        </div>
        <div className="text-xs text-[#1E7A4A] mt-2">↓ Drag to reorder</div>
      </div>
    ),
  },
  {
    title: "Public Menu Page",
    description: "Search, categories, dark mode. Optimized for every device.",
    icon: "📱",
    size: "big",
    uiSnippet: (
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 bg-[#0B0F0E] rounded-lg px-2 py-1.5 border border-[#1B2420]">
          <Search className="w-3 h-3 text-[#A6B0AA]" />
          <input
            type="text"
            placeholder="Search menu..."
            className="bg-transparent text-xs text-[#A6B0AA] flex-1 outline-none"
            readOnly
          />
        </div>
        <div className="flex gap-1">
          <span className="text-xs px-2 py-1 bg-[#1E7A4A]/20 text-[#1E7A4A] rounded">Pizza</span>
          <span className="text-xs px-2 py-1 bg-[#1B2420] text-[#A6B0AA] rounded">Salads</span>
          <span className="text-xs px-2 py-1 bg-[#1B2420] text-[#A6B0AA] rounded">Pasta</span>
        </div>
      </div>
    ),
  },
  {
    title: "QR Code Stays Same",
    description: "Update menu content, QR never changes.",
    icon: <QrCode className="w-6 h-6" />,
    size: "small",
    uiSnippet: (
      <div className="mt-4 flex flex-col items-center">
        <QrPreview url="https://scandish.ca/menu/demo" size={80} />
        <button className="mt-2 text-xs text-[#1E7A4A] hover:text-[#2AAE67] flex items-center gap-1">
          <Download className="w-3 h-3" />
          Download PNG
        </button>
      </div>
    ),
  },
  {
    title: "Photos + Specials",
    description: "Showcase dishes with photos. Boost sales.",
    icon: <ImageIcon className="w-6 h-6" />,
    size: "small",
    uiSnippet: (
      <div className="mt-4 space-y-2">
        <div className="bg-[#0B0F0E] border border-[#1B2420] rounded-lg p-2">
          <div className="w-full h-16 bg-gradient-to-br from-[#1E7A4A]/20 to-[#1B2420] rounded flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-[#1E7A4A]" />
          </div>
          <div className="mt-2 text-xs text-[#F3F5F4] font-medium">Special: Margherita</div>
          <div className="text-xs text-[#1E7A4A]">$16.99</div>
        </div>
      </div>
    ),
  },
  {
    title: "Analytics Insights",
    description: "Top clicked items, engagement metrics, revenue opportunities.",
    icon: <BarChart3 className="w-6 h-6" />,
    size: "small",
    uiSnippet: (
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#A6B0AA]">Top Item</span>
          <span className="text-[#1E7A4A] font-semibold">Margherita</span>
        </div>
        <div className="h-2 bg-[#1B2420] rounded-full overflow-hidden">
          <div className="h-full bg-[#1E7A4A] rounded-full" style={{ width: "75%" }} />
        </div>
        <div className="flex items-center gap-1 text-xs text-[#A6B0AA]">
          <TrendingUp className="w-3 h-3" />
          <span>+18% this week</span>
        </div>
      </div>
    ),
  },
  {
    title: "Custom Branding",
    description: "Logo, colors, fonts. Match your restaurant's style.",
    icon: <Palette className="w-6 h-6" />,
    size: "small",
    uiSnippet: (
      <div className="mt-4 space-y-2">
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded bg-[#1E7A4A]" />
          <div className="w-8 h-8 rounded bg-[#2AAE67]" />
          <div className="w-8 h-8 rounded bg-[#1B2420] border border-[#1E7A4A]" />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 rounded bg-[#0B0F0E] border border-[#1B2420] flex items-center justify-center">
            <span className="text-[8px] text-[#1E7A4A]">L</span>
          </div>
          <span className="text-[#A6B0AA]">Your Logo</span>
        </div>
      </div>
    ),
  },
  {
    title: "Multi-Location + Teams",
    description: "Manage multiple locations. Invite team members with roles.",
    icon: <Users className="w-6 h-6" />,
    size: "wide",
    uiSnippet: (
      <div className="mt-4 space-y-2">
        <div className="bg-[#0B0F0E] border border-[#1B2420] rounded-lg p-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#F3F5F4]">Downtown Location</span>
            <span className="text-[#1E7A4A] text-[10px]">Active</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#A6B0AA]">Airport Branch</span>
            <span className="text-[#1E7A4A] text-[10px]">Active</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#A6B0AA]">Midtown Restaurant</span>
            <span className="text-[#1E7A4A] text-[10px]">Active</span>
          </div>
        </div>
        <div className="text-xs text-[#A6B0AA]">3 locations • 5 team members</div>
      </div>
    ),
  },
];

export default function BentoFeatures() {
  const ref = useBentoReveal();

  return (
    <section
      ref={ref}
      id="features"
      className="px-6 md:px-12 lg:px-24 py-20 bg-[#0B0F0E]"
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
            Everything you need
          </h2>
          <p className="text-xl text-[#A6B0AA]">
            Built for speed. Built for conversion.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              data-reveal
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`
                ${feature.size === "big" ? "md:col-span-2 md:row-span-2" : ""}
                ${feature.size === "wide" ? "md:col-span-2" : ""}
                bg-[#101614] border-2 border-[#1B2420] rounded-2xl p-6 hover:border-[#1E7A4A] hover:shadow-lg transition-all cursor-pointer
              `}
            >
              <div className="flex items-center gap-3 mb-3">
                {typeof feature.icon === "string" ? (
                  <span className="text-3xl">{feature.icon}</span>
                ) : (
                  <div className="text-[#1E7A4A]">{feature.icon}</div>
                )}
                <h3 className="text-lg font-semibold text-[#F3F5F4]">
                  {feature.title}
                </h3>
              </div>
              <p className="text-sm text-[#A6B0AA] mb-4">{feature.description}</p>
              
              {/* UI Snippet */}
              {feature.uiSnippet && (
                <div className="mt-4 pt-4 border-t border-[#1B2420]">
                  {feature.uiSnippet}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
