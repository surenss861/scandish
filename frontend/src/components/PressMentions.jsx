import React from "react";

export default function PressMentions() {
  const recognitions = [
    {
      title: "500+ Restaurants Served",
      subtitle: "From food trucks to fine dining",
      icon: "🍽️",
    },
    {
      title: "50K+ QR Scans",
      subtitle: "Menus viewed by thousands of diners",
      icon: "📱",
    },
    {
      title: "99.9% Uptime",
      subtitle: "Powered by Supabase & Vercel",
      icon: "⚡",
    },
    {
      title: "4.9/5 Rating",
      subtitle: "Loved by restaurant owners",
      icon: "⭐",
    },
  ];

  return (
    <section className="py-20 bg-[#080705] text-center">
      <h2 className="text-3xl font-bold text-[#F3C77E] mb-8">
        Trusted by Restaurants Worldwide
      </h2>

      <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto px-6">
        {recognitions.map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-xl bg-white/5 backdrop-blur hover:bg-white/10 transition"
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="text-lg font-semibold text-[#FFFFFA]">
              {item.title}
            </h3>
            <p className="text-sm text-[#a7a7a7]">{item.subtitle}</p>
          </div>
        ))}
      </div>

      <p className="mt-12 italic text-[#d6d6d6] max-w-2xl mx-auto">
        “Scandish is exactly what restaurant owners needed: simple, affordable,
        and it just works.”
      </p>
      <p className="text-sm text-[#F3C77E] mt-2">— Customer Review</p>
    </section>
  );
}
