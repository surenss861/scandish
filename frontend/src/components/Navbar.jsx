import React from "react";
import { Link } from "react-router-dom";
import { LogoWithText } from "./Logo";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-[#080705]/80 border-b border-[#40434E]/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <LogoWithText />
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/#features" className="hover:text-[#F3C77E]">Features</Link>
          <Link to="/#pricing" className="hover:text-[#F3C77E]">Pricing</Link>
          <Link to="/#faq" className="hover:text-[#F3C77E]">FAQ</Link>
          <Link to="/login" className="px-4 py-2 bg-[#702632] text-[#FFFFFA] rounded-lg hover:bg-[#912F40] transition">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
