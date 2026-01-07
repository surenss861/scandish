import React from "react";
import { Link } from "react-router-dom";
import { LogoWithText } from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Start free in 3 minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Start Free
            </Link>
            <Link
              to="/menu/demo"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <LogoWithText />
          <p className="mt-4 text-gray-600">
            Scandish helps restaurants serve better with instant QR menus.
          </p>
        </div>

        <div>
          <h3 className="text-gray-900 font-semibold mb-3">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/privacy" className="text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-gray-600 hover:text-gray-900">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/help" className="text-gray-600 hover:text-gray-900">
                Help Center
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-gray-900 font-semibold mb-3">Contact</h3>
          <p className="text-gray-600">
            Email:{" "}
            <a
              href="mailto:support@scandish.ca"
              className="text-[#F3C77E] hover:underline"
            >
              support@scandish.ca
            </a>
          </p>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Scandish, Inc. All rights reserved.
      </div>
    </footer>
  );
}
