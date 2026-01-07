import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useBentoReveal } from "../hooks/useBentoReveal.js";

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
    annualPrice: 150, // 2 months free (20% off)
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
    annualPrice: 490, // 2 months free (20% off)
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
    roiLine: "Pays for itself if it increases 1 table's order per day.",
    cta: "Subscribe Pro",
    href: "https://whop.com/checkout/plan_PNrOKuTP2C51K?d2c=true",
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const ref = useBentoReveal();

  return (
    <section
      ref={ref}
      id="pricing"
      className="px-6 md:px-12 lg:px-24 py-20 bg-[#0B0F0E]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          data-reveal
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#F3F5F4] mb-4">
            Simple Pricing
          </h2>
          <p className="text-xl text-[#A6B0AA] mb-8">
            Choose monthly or save 20% with annual billing
          </p>

          {/* Annual Toggle */}
          <div className="inline-flex items-center gap-4 bg-[#101614] border-2 border-[#1B2420] rounded-xl p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                !isAnnual
                  ? "bg-[#1E7A4A] text-[#F3F5F4]"
                  : "text-[#A6B0AA] hover:text-[#F3F5F4]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                isAnnual
                  ? "bg-[#1E7A4A] text-[#F3F5F4]"
                  : "text-[#A6B0AA] hover:text-[#F3F5F4]"
              }`}
            >
              Annual <span className="text-sm text-[#2AAE67]">(Save 20%)</span>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => {
            const monthlyCost = isAnnual && plan.price > 0 
              ? (plan.annualPrice / 12).toFixed(2)
              : plan.price;
            const annualSavings = plan.price > 0 
              ? ((plan.price * 12) - plan.annualPrice).toFixed(0)
              : 0;

            return (
              <motion.div
                key={idx}
                data-reveal
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative bg-[#101614] border-2 rounded-2xl p-8 ${
                  plan.popular
                    ? "border-[#1E7A4A] shadow-lg"
                    : "border-[#1B2420] hover:border-[#1E7A4A]"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#1E7A4A] text-[#F3F5F4] px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-[#F3F5F4] mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[#A6B0AA] mb-6">{plan.description}</p>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-[#F3F5F4]">
                        ${isAnnual ? plan.annualPrice : plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-lg text-[#A6B0AA]">
                          /{isAnnual ? "year" : plan.period}
                        </span>
                      )}
                    </div>
                    {isAnnual && plan.price > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-sm text-[#A6B0AA]">
                          ${monthlyCost}/mo billed annually
                        </div>
                        <div className="text-sm font-semibold text-[#1E7A4A]">
                          Save ${annualSavings}/year
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-8 space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="text-[#1E7A4A] flex-shrink-0" size={18} />
                      <span className="text-sm text-[#A6B0AA]">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations?.map((limitation, i) => (
                    <div key={i} className="flex items-center gap-3 opacity-60">
                      <span className="text-sm text-[#A6B0AA] line-through">
                        {limitation}
                      </span>
                    </div>
                  ))}
                  
                  {/* ROI Line for Pro */}
                  {plan.roiLine && (
                    <div className="mt-4 pt-4 border-t border-[#1B2420]">
                      <p className="text-xs text-[#1E7A4A] italic">
                        💡 {plan.roiLine}
                      </p>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Link
                  to={plan.href}
                  className={`block text-center px-6 py-3 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? "bg-[#1E7A4A] text-[#F3F5F4] hover:bg-[#2AAE67]"
                      : plan.price === 0
                      ? "bg-[#1B2420] text-[#F3F5F4] hover:bg-[#1E7A4A]"
                      : "bg-[#1B2420] text-[#F3F5F4] hover:bg-[#1E7A4A]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Enterprise CTA */}
        <motion.div
          data-reveal
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="bg-[#101614] border-2 border-[#1B2420] rounded-2xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-[#F3F5F4] mb-2">
              Need 5+ locations?
            </h3>
            <p className="text-sm text-[#A6B0AA] mb-4">
              Contact us for enterprise pricing and custom solutions
            </p>
            <a
              href="mailto:support@scandish.ca?subject=Enterprise Inquiry"
              className="inline-block px-6 py-2 bg-[#1B2420] text-[#1E7A4A] rounded-xl font-semibold hover:bg-[#1E7A4A] hover:text-[#F3F5F4] transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          data-reveal
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-[#101614] border-2 border-[#1B2420] rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-[#F3F5F4] mb-4">
              Start free, upgrade anytime
            </h3>
            <p className="text-[#A6B0AA] mb-6">
              Most restaurants see ROI within the first month. No setup fees,
              cancel anytime.
            </p>
            <Link
              to="/login"
              className="inline-block px-8 py-3 bg-[#1E7A4A] text-[#F3F5F4] rounded-xl font-semibold hover:bg-[#2AAE67] transition-colors"
            >
              Get Started Now
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
