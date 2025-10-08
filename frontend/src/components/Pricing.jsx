import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: 0,
    period: "",
    description: "testing",
    icon: "🥗",
    features: [
      "1 Menu",
      "3 Menu Items Max",
      "QR Code Generation",
      "Mobile-Friendly",
    ],
    limitations: ["No watermark removal", "No photos", "No analytics", "No locations", "No templates"],
    cta: "Start Free",
    href: "/signup", // Free plan → signup route
  },
  {
    name: "Starter",
    price: 9,
    period: "month",
    description: "small restaurants",
    icon: "🍷",
    popular: true,
    features: [
      "Up to 5 Menus",
      "Unlimited Menu Items",
      "Upload Photos (boost upsells)",
      "Remove Watermark",
      "Locations Management",
      "Menu Templates",
      "Priority Email Support",
    ],
    note: "clean + professional, not bloated",
    cta: "Subscribe Starter",
    href: "https://whop.com/checkout/plan_9dfgdFgWDo0yh?d2c=true", // Whop Starter link
  },
  {
    name: "Pro",
    price: 29,
    period: "month",
    description: "restaurant chains",
    icon: "🍾",
    features: [
      "Unlimited Menus",
      "Advanced Analytics (views, scans, clicks)",
      "Custom Branding (logo + colors)",
      "Dedicated Support",
    ],
    note: "makes sense for bigger restaurants",
    cta: "Subscribe Pro",
    href: "https://whop.com/checkout/plan_PNrOKuTP2C51K?d2c=true", // Whop Pro link
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative px-8 md:px-16 lg:px-32 py-24">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#702632]/5 via-transparent to-[#F3C77E]/5" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFA] mb-4">
            Simple Pricing That{" "}
            <span className="text-[#F3C77E]">Actually Saves Money</span>
          </h2>
          <p className="text-lg text-[#d6d6d6] max-w-3xl mx-auto">
            Stop spending hundreds on menu reprints. Scandish pays for itself
            from day one.
          </p>
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
              whileHover={{ scale: 1.02, y: -5 }}
              className={`group relative rounded-3xl p-8 transition-all duration-300 ${plan.popular
                ? "bg-gradient-to-br from-[#F3C77E]/10 via-[#0f0e0c]/90 to-[#702632]/10 border-2 border-[#F3C77E]/50"
                : "bg-[#0f0e0c]/80 border border-[#40434E]/40 hover:border-[#F3C77E]/30"
                }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-[#080705] px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#F3C77E]/10 via-[#702632]/10 to-[#F3C77E]/10 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 text-center mb-8">
                <div className="text-4xl mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-bold text-[#FFFFFA] mb-2">
                  {plan.name}
                </h3>
                <p className="text-[#a7a7a7] mb-6">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-4xl md:text-5xl font-bold text-[#F3C77E]">
                    ${plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-lg text-[#a7a7a7]">
                      /{plan.period}
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <Check className="text-[#F3C77E]" size={16} />
                      <span className="text-[#d6d6d6]">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 opacity-60 text-sm"
                    >
                      <span className="line-through text-[#a7a7a7]">
                        {limitation}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Note */}
                {plan.note && (
                  <div className="mt-4 p-3 bg-[#F3C77E]/10 border border-[#F3C77E]/20 rounded-lg">
                    <p className="text-xs text-[#F3C77E] italic text-center">
                      ({plan.note})
                    </p>
                  </div>
                )}
              </div>

              {/* CTA */}
              <a
                href={plan.href}
                target={plan.price > 0 ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`block text-center px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg ${plan.popular
                  ? "bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-[#080705] hover:from-[#d6a856] hover:to-[#F3C77E]"
                  : plan.price === 0
                    ? "bg-[#40434E]/20 border border-[#40434E]/40 text-[#FFFFFA] hover:border-[#F3C77E]/50 hover:bg-[#F3C77E]/10"
                    : "bg-[#702632] text-[#FFFFFA] hover:bg-[#912F40]"
                  }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Section CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-[#702632]/10 via-[#F3C77E]/10 to-[#702632]/10 border border-[#F3C77E]/20 rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Still Not Sure Which Plan?
            </h3>
            <p className="text-[#d6d6d6] mb-6">
              Start with our free plan and upgrade anytime. Most restaurants see ROI within the first month.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
              >
                Get Started Now
                <span>🚀</span>
              </Link>
              <a
                href="mailto:support@scandish.ca"
                className="inline-flex items-center gap-2 px-8 py-4 border border-[#F3C77E] text-[#F3C77E] rounded-xl font-medium hover:bg-[#F3C77E]/10 transition-colors"
              >
                Get Personal Recommendation
                <span>💬</span>
              </a>
            </div>
            <p className="text-xs text-[#a7a7a7]">
              No setup fees • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
