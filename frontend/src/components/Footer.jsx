import React from "react";
import { Link } from "react-router-dom";
import { LogoWithText } from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-[#0B0F0E] border-t border-[#1B2420] py-12">
      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-[#101614] border-2 border-[#1B2420] rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-[#F3F5F4] mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-[#A6B0AA] mb-6 max-w-2xl mx-auto">
            Start free in 3 minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#1E7A4A] text-[#F3F5F4] rounded-xl font-semibold hover:bg-[#2AAE67] transition-colors"
            >
              Start Free
            </Link>
            <Link
              to="/menu/demo"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#1B2420] text-[#A6B0AA] rounded-xl font-semibold hover:border-[#1E7A4A] hover:text-[#F3F5F4] transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <LogoWithText />
          <p className="mt-4 text-[#A6B0AA]">
            Scandish helps restaurants serve better with instant QR menus.
          </p>
        </div>

        <div>
          <h3 className="text-[#F3F5F4] font-semibold mb-3">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/privacy"
                className="text-[#A6B0AA] hover:text-[#1E7A4A]"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="text-[#A6B0AA] hover:text-[#1E7A4A]"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/help" className="text-[#A6B0AA] hover:text-[#1E7A4A]">
                Help Center
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[#F3F5F4] font-semibold mb-3">Contact</h3>
          <p className="text-[#A6B0AA]">
            Email:{" "}
            <a
              href="mailto:support@scandish.ca"
              className="text-[#1E7A4A] hover:underline"
            >
              support@scandish.ca
            </a>
          </p>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-[#A6B0AA]">
        © {new Date().getFullYear()} Scandish, Inc. All rights reserved.
      </div>
    </footer>
  );
}
