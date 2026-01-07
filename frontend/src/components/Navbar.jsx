import React from "react";
import { Link } from "react-router-dom";
import { LogoWithText } from "./Logo";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <LogoWithText />
        </Link>

        <div className="flex items-center gap-8 text-sm font-medium text-gray-700">
          <Link to="/#features" className="hover:text-gray-900 transition-colors">
            Features
          </Link>
          <Link to="/#pricing" className="hover:text-gray-900 transition-colors">
            Pricing
          </Link>
          <Link to="/#faq" className="hover:text-gray-900 transition-colors">
            FAQ
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 bg-[#F3C77E] text-gray-900 rounded-lg hover:bg-[#d6a856] transition-colors font-semibold"
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
