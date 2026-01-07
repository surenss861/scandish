import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: 0,
    annualPrice: 0,
    period: "",
    description: "Perfect for testing",
    features: [
      "1 Menu",
      "3 Menu Items Max",
      "QR Code Generation",
      "Mobile-Friendly",
      "Scandish Watermark",
    ],
    limitations: ["No photos", "No analytics", "No branding"],
    cta: "Start Free",
    href: "/login",
  },
  {
    name: "Starter",
    price: 15,
    annualPrice: 150, // 2 months free
    period: "month",
    description: "For single-location restaurants",
    popular: true,
    features: [
      "Up to 5 Menus",
      "Unlimited Menu Items",
      "Remove Watermark",
      "Photo Uploads (5/month)",
      "Basic Analytics",
      "Custom Branding",
      "Email Support",
    ],
    cta: "Subscribe Starter",
    href: "https://whop.com/checkout/plan_9dfgdFgWDo0yh?d2c=true",
  },
  {
    name: "Professional",
    price: 49,
    annualPrice: 490, // 2 months free
    period: "month",
    description: "For growing + multi-location",
    features: [
      "Unlimited Menus",
      "Unlimited Photos",
      "Advanced Analytics",
      "AI Insights",
      "Full Custom Branding",
      "Bulk Import",
      "Priority Support",
    ],
    cta: "Subscribe Pro",
    href: "https://whop.com/checkout/plan_PNrOKuTP2C51K?d2c=true",
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="px-6 md:px-12 lg:px-24 py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose monthly or save 20% with annual billing
          </p>

          {/* Annual Toggle */}
          <div className="inline-flex items-center gap-4 bg-white border-2 border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                !isAnnual
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                isAnnual
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Annual <span className="text-sm text-[#F3C77E]">(Save 20%)</span>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`relative bg-white border-2 rounded-2xl p-8 ${
                plan.popular
                  ? "border-[#F3C77E] shadow-xl"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#F3C77E] text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">
                    ${isAnnual ? plan.annualPrice : plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-lg text-gray-600">
                      /{isAnnual ? "year" : plan.period}
                    </span>
                  )}
                  {isAnnual && plan.price > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      ${plan.price}/mo billed annually
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mb-8 space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="text-[#F3C77E] flex-shrink-0" size={18} />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
                {plan.limitations?.map((limitation, i) => (
                  <div key={i} className="flex items-center gap-3 opacity-60">
                    <span className="text-sm text-gray-500 line-through">
                      {limitation}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                to={plan.href}
                className={`block text-center px-6 py-3 rounded-xl font-semibold transition-colors ${
                  plan.popular
                    ? "bg-[#F3C77E] text-gray-900 hover:bg-[#d6a856]"
                    : plan.price === 0
                    ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Start free, upgrade anytime
            </h3>
            <p className="text-gray-600 mb-6">
              Most restaurants see ROI within the first month. No setup fees, cancel anytime.
            </p>
            <Link
              to="/login"
              className="inline-block px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Get Started Now
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
