import React from "react";
import { motion } from "framer-motion";
import { Search, BarChart3, Palette, Users, QrCode, Image as ImageIcon } from "lucide-react";

const features = [
  {
    title: "Drag & Drop Editor",
    description: "Reorder items instantly. No coding required.",
    icon: "🎯",
    size: "big",
    color: "bg-blue-50 border-blue-200",
  },
  {
    title: "Public Menu Page",
    description: "Search, categories, dark mode. Optimized for every device.",
    icon: "📱",
    size: "big",
    color: "bg-green-50 border-green-200",
  },
  {
    title: "QR Code Stays Same",
    description: "Update menu content, QR never changes.",
    icon: <QrCode className="w-6 h-6" />,
    size: "small",
    color: "bg-purple-50 border-purple-200",
  },
  {
    title: "Photos + Specials",
    description: "Showcase dishes with photos. Boost sales.",
    icon: <ImageIcon className="w-6 h-6" />,
    size: "small",
    color: "bg-amber-50 border-amber-200",
  },
  {
    title: "Analytics Insights",
    description: "Top clicked items, engagement metrics, revenue opportunities.",
    icon: <BarChart3 className="w-6 h-6" />,
    size: "small",
    color: "bg-indigo-50 border-indigo-200",
  },
  {
    title: "Custom Branding",
    description: "Logo, colors, fonts. Match your restaurant's style.",
    icon: <Palette className="w-6 h-6" />,
    size: "small",
    color: "bg-pink-50 border-pink-200",
  },
  {
    title: "Multi-Location + Teams",
    description: "Manage multiple locations. Invite team members with roles.",
    icon: <Users className="w-6 h-6" />,
    size: "wide",
    color: "bg-gray-50 border-gray-200",
  },
];

export default function BentoFeatures() {
  return (
    <section id="features" className="px-6 md:px-12 lg:px-24 py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need
          </h2>
          <p className="text-xl text-gray-600">
            Built for speed. Built for conversion.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`
                ${feature.size === "big" ? "md:col-span-2 md:row-span-2" : ""}
                ${feature.size === "wide" ? "md:col-span-2" : ""}
                ${feature.color}
                border-2 rounded-2xl p-6 hover:shadow-lg transition-shadow
              `}
            >
              <div className="flex items-center gap-3 mb-3">
                {typeof feature.icon === "string" ? (
                  <span className="text-3xl">{feature.icon}</span>
                ) : (
                  <div className="text-gray-700">{feature.icon}</div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

