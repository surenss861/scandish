import React from "react";
import { Link } from "react-router-dom";

const items = [
  {
    title: "Instant Updates",
    desc: "Change prices or specials in seconds. No reprinting menus.",
    cta: "Try Live Demo",
    ctaAction: "demo"
  },
  {
    title: "Mobile Friendly",
    desc: "Optimized for any phone — no pinching, no PDFs.",
    cta: "See Preview",
    ctaAction: "preview"
  },
  {
    title: "Upsell Made Easy",
    desc: "Showcase specials with photos to boost sales.",
    cta: "Start Free",
    ctaAction: "signup"
  },
];

export default function Features() {
  return (
    <section id="features" className="px-8 md:px-16 lg:px-32 py-24">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
        Why Restaurants <span className="text-[#F3C77E]">Love Scandish</span>
      </h2>
      <div className="grid md:grid-cols-3 gap-12">
        {items.map((f, i) => (
          <div key={i} className="group p-6 rounded-xl bg-[#40434E]/20 border border-[#40434E]/40 fade-in-up hover:border-[#F3C77E]/30 hover:bg-[#40434E]/30 transition-all duration-300">
            <h3 className="text-xl font-semibold text-[#F3C77E] mb-3">{f.title}</h3>
            <p className="text-[#d6d6d6] mb-4">{f.desc}</p>
            <div className="mt-4">
              {f.ctaAction === "demo" ? (
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3C77E]/20 text-[#F3C77E] rounded-lg border border-[#F3C77E]/30 hover:bg-[#F3C77E]/30 hover:scale-105 transition-all duration-200 font-medium">
                  {f.cta} <span>▶️</span>
                </button>
              ) : f.ctaAction === "preview" ? (
                <Link to="/demo" className="inline-flex items-center gap-2 px-4 py-2 bg-[#702632]/20 text-[#702632] rounded-lg border border-[#702632]/30 hover:bg-[#702632]/30 hover:scale-105 transition-all duration-200 font-medium">
                  {f.cta} <span>👀</span>
                </Link>
              ) : (
                <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-lg hover:scale-105 transition-all duration-200 font-bold">
                  Get Started <span>🚀</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Section CTA */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-[#F3C77E]/10 to-[#d6a856]/10 border border-[#F3C77E]/20 rounded-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Transform Your Menu?
          </h3>
          <p className="text-[#d6d6d6] mb-6">
            Join thousands of restaurants already saving money and delighting customers with digital menus
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
            >
              Get Started Now
              <span>✨</span>
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 border border-[#F3C77E] text-[#F3C77E] rounded-xl font-medium hover:bg-[#F3C77E]/10 transition-colors"
            >
              View Live Demo
              <span>🎯</span>
            </Link>
          </div>
          <p className="text-xs text-[#a7a7a7] mt-4">
            Setup in 5 minutes • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
}
