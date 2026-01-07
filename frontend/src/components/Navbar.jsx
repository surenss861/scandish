import React from "react";
import { Link } from "react-router-dom";
import { LogoWithText } from "./Logo";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#0B0F0E]/80 backdrop-blur-sm border-b border-[#1B2420]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <LogoWithText />
        </Link>

        <div className="flex items-center gap-8 text-sm font-medium text-[#A6B0AA]">
          <Link
            to="/#features"
            className="hover:text-[#F3F5F4] transition-colors"
          >
            Features
          </Link>
          <Link
            to="/#pricing"
            className="hover:text-[#F3F5F4] transition-colors"
          >
            Pricing
          </Link>
          <Link to="/#faq" className="hover:text-[#F3F5F4] transition-colors">
            FAQ
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 bg-[#1B2420] text-[#F3F5F4] rounded-lg hover:bg-[#1E7A4A] transition-colors"
          >
            Login
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 bg-[#1E7A4A] text-[#F3F5F4] rounded-lg hover:bg-[#2AAE67] transition-colors font-semibold"
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
