import React from "react";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import BentoFeatures from "../components/BentoFeatures.jsx";
import BeforeAfter from "../components/BeforeAfter.jsx";
import Pricing from "../components/Pricing.jsx";
import Testimonials from "../components/Testimonials.jsx";
import FAQ from "../components/FAQ.jsx";
import Footer from "../components/Footer.jsx";

export default function Landing() {
  return (
    <div className="bg-[#0B0F0E] text-[#F3F5F4] min-h-screen">
      <Navbar />
      <Hero />
      <BentoFeatures />
      <BeforeAfter />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
}
