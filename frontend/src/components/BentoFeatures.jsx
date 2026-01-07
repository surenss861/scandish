import React from "react";
import { motion } from "framer-motion";
import { Search, BarChart3, Palette, Users, QrCode, Image as ImageIcon } from "lucide-react";
import { useBentoReveal } from "../hooks/useBentoReveal.js";

const features = [
  {
    title: "Drag & Drop Editor",
    description: "Reorder items instantly. No coding required.",
    icon: "🎯",
    size: "big",
  },
  {
    title: "Public Menu Page",
    description: "Search, categories, dark mode. Optimized for every device.",
    icon: "📱",
    size: "big",
  },
  {
    title: "QR Code Stays Same",
    description: "Update menu content, QR never changes.",
    icon: <QrCode className="w-6 h-6" />,
    size: "small",
  },
  {
    title: "Photos + Specials",
    description: "Showcase dishes with photos. Boost sales.",
    icon: <ImageIcon className="w-6 h-6" />,
    size: "small",
  },
  {
    title: "Analytics Insights",
    description: "Top clicked items, engagement metrics, revenue opportunities.",
    icon: <BarChart3 className="w-6 h-6" />,
    size: "small",
  },
  {
    title: "Custom Branding",
    description: "Logo, colors, fonts. Match your restaurant's style.",
    icon: <Palette className="w-6 h-6" />,
    size: "small",
  },
  {
    title: "Multi-Location + Teams",
    description: "Manage multiple locations. Invite team members with roles.",
    icon: <Users className="w-6 h-6" />,
    size: "wide",
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
              <p className="text-sm text-[#A6B0AA]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
