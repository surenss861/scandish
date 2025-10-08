import React from "react";
import { Link } from "react-router-dom";
import { LogoWithText } from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-[#40434E]/40 bg-[#080705] py-12">
      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-gradient-to-r from-[#F3C77E]/10 to-[#d6a856]/10 border border-[#F3C77E]/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-[#d6d6d6] mb-6 max-w-2xl mx-auto">
            Join hundreds of restaurants already saving money and delighting customers with digital menus.
            Get started today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
            >
              Get Started Now
              <span>🚀</span>
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 border border-[#F3C77E] text-[#F3C77E] rounded-xl font-medium hover:bg-[#F3C77E]/10 transition-colors"
            >
              View Demo
              <span>👀</span>
            </Link>
          </div>
          <p className="text-xs text-[#a7a7a7] mt-4">
            Setup in 5 minutes • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <LogoWithText />
          <p className="mt-4 text-[#a7a7a7]">
            Scandish helps restaurants serve better with instant QR menus.
          </p>
        </div>

        <div>
          <h3 className="text-[#F3C77E] font-semibold mb-3">Company</h3>
          <ul className="space-y-2">
            <li><Link to="/privacy" className="hover:text-[#F3C77E]">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-[#F3C77E]">Terms of Service</Link></li>
            <li><Link to="/help" className="hover:text-[#F3C77E]">Help Center</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-[#F3C77E] font-semibold mb-3">Contact</h3>
          <p className="text-[#a7a7a7]">
            Email: <a href="mailto:support@scandish.ca" className="hover:underline text-[#F3C77E]">support@scandish.ca</a>
          </p>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-[#777]">
        © {new Date().getFullYear()} Scandish, Inc. All rights reserved.
      </div>
    </footer>
  );
}
