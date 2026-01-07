import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

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

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="px-6 md:px-12 lg:px-24 py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Scandish
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-colors"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className="shrink-0 text-gray-600">
                  {openIndex === index ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5">
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Support CTA */}
        <div className="mt-16 text-center bg-white border-2 border-gray-200 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Still Have Questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Our support team responds within 2 hours during business hours
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Get Started Now
            </Link>
            <a
              href="mailto:support@scandish.ca"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
