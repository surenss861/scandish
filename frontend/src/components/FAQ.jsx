import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useBentoReveal } from "../hooks/useBentoReveal.js";

const faqs = [
  {
    question: "How quickly can I set up my first menu?",
    answer:
      "Most restaurants have their menu live in under 10 minutes. Just add your items, generate the QR code, and print it out. No technical knowledge required.",
  },
  {
    question: "What happens if I need to update prices during busy hours?",
    answer:
      "Updates are instant! Change a price in your dashboard and it's live immediately. Your QR code never changes - customers always see the latest version.",
  },
  {
    question: "Do my customers need to download an app?",
    answer:
      "No! Your menu works in any web browser. Customers just scan the QR code and view your menu instantly. No downloads, no friction.",
  },
  {
    question: "How much money will I save compared to printing menus?",
    answer:
      "Most restaurants save $200-500/month on printing costs. Scandish Starter costs just $15/month, so you'll save money from day one while getting a better customer experience.",
  },
  {
    question: "Can I customize the look of my menu?",
    answer:
      "Yes! Starter users can upload photos and customize colors. Professional users get full branding control including custom domains.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, cancel anytime with no fees. You'll keep access until your billing period ends. We also offer a 14-day free trial for all paid plans.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const ref = useBentoReveal();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      ref={ref}
      id="faq"
      className="px-6 md:px-12 lg:px-24 py-20 bg-[#0B0F0E]"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          data-reveal
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#F3F5F4] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-[#A6B0AA]">
            Everything you need to know about Scandish
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              data-reveal
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#101614] border-2 border-[#1B2420] rounded-2xl overflow-hidden hover:border-[#1E7A4A] transition-colors"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[#0B0F0E] transition-colors"
              >
                <h3 className="font-semibold text-[#F3F5F4] pr-4">
                  {faq.question}
                </h3>
                <div className="shrink-0 text-[#A6B0AA]">
                  {openIndex === index ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5">
                  <div className="pt-2 border-t border-[#1B2420]">
                    <p className="text-[#A6B0AA] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Support CTA */}
        <motion.div
          data-reveal
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-[#101614] border-2 border-[#1B2420] rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-[#F3F5F4] mb-3">
            Still Have Questions?
          </h3>
          <p className="text-[#A6B0AA] mb-6">
            Our support team responds within 2 hours during business hours
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-[#1E7A4A] text-[#F3F5F4] rounded-xl font-semibold hover:bg-[#2AAE67] transition-colors"
            >
              Get Started Now
            </Link>
            <a
              href="mailto:support@scandish.ca"
              className="px-6 py-3 border-2 border-[#1B2420] text-[#A6B0AA] rounded-xl font-semibold hover:border-[#1E7A4A] hover:text-[#F3F5F4] transition-colors"
            >
              Email Support
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
