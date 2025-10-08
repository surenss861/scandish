import React, { useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import Features from "../components/Features.jsx";
import Pricing from "../components/Pricing.jsx";
import Footer from "../components/Footer.jsx";
import Testimonials from "../components/Testimonials.jsx";
import AnimatedCounters from "../components/AnimatedCounters.jsx";
import FAQ from "../components/FAQ.jsx";

export default function Landing() {
  // tiny animations (optional)
  useEffect(() => {
    if (!document.getElementById("scandish-anim-styles")) {
      const style = document.createElement("style");
      style.id = "scandish-anim-styles";
      style.innerHTML = `
        .scanlines-move{background-image:linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px);background-size:100% 2px;animation:scanlineShift 8s linear infinite}
        @keyframes scanlineShift{0%{background-position:0 0}100%{background-position:0 2px}}
        .fade-in-bottom{animation:fade-in-bottom .8s ease-out both}
        .fade-in-bottom-delay{animation:fade-in-bottom .8s ease-out .3s both}
        .fade-in-up{animation:fade-in-up .8s ease-out both}
        @keyframes fade-in-bottom{0%{opacity:0;transform:translateY(40px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes fade-in-up{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes pulseQR{0%{transform:scale(.96);opacity:.18}50%{transform:scale(1.04);opacity:.35}100%{transform:scale(.96);opacity:.18}}
        .animate-pulseQR{animation:pulseQR 2.6s ease-in-out infinite}
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="bg-[#080705] text-[#FFFFFA] min-h-screen flex flex-col font-sans relative overflow-hidden">
      {/* background layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 scanlines-move" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(80%_60%_at_50%_10%,rgba(255,255,255,0.06),transparent_60%)]"
      />

      <Navbar />
      <Hero />
      <AnimatedCounters />
      {/* <PressMentions /> removed */}
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
