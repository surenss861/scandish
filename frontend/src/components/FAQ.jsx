import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const faqs = [
    {
        question: "How quickly can I set up my first menu?",
        answer: "Most restaurants have their menu live in under 10 minutes. Just add your items, generate the QR code, and print it out. No technical knowledge required."
    },
    {
        question: "What happens if I need to update prices during busy hours?",
        answer: "Updates are instant! Change a price in your dashboard and it's live immediately. Your QR code never changes - customers always see the latest version."
    },
    {
        question: "Do my customers need to download an app?",
        answer: "No! Your menu works in any web browser. Customers just scan the QR code and view your menu instantly. No downloads, no friction."
    },
    {
        question: "How much money will I save compared to printing menus?",
        answer: "Most restaurants save $200-500/month on printing costs. QuickMenu Pro costs just $9/month, so you'll save money from day one while getting a better customer experience."
    },
    {
        question: "What if my internet goes down?",
        answer: "Your menus are hosted on enterprise-grade servers with 99.9% uptime. Even if your restaurant WiFi is down, customers can still view your menu using mobile data."
    },
    {
        question: "Can I customize the look of my menu?",
        answer: "Yes! Pro users can upload photos, remove the QuickMenu watermark, and customize colors. Business users get full branding control and custom domains."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use bank-level SSL encryption, are GDPR compliant, and host on Supabase's secure infrastructure. Your menu data is always protected."
    },
    {
        question: "Can I cancel anytime?",
        answer: "Yes, cancel anytime with no fees. You'll keep access until your billing period ends. We also offer a 7-day free trial for all paid plans."
    },
    {
        question: "Do you offer QR code stickers?",
        answer: "Yes! We offer professional QR sticker packs for $5 that you can place on tables, windows, or anywhere customers need access to your menu."
    },
    {
        question: "How does QuickMenu compare to other digital menu solutions?",
        answer: "Unlike complex solutions that require apps or special hardware, QuickMenu works with just a QR code. It's simpler, faster, and more affordable than alternatives."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="relative py-24 px-8 md:px-16 lg:px-32">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFA] mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-[#d6d6d6]">
                        Everything you need to know about QuickMenu
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="group bg-[#0f0e0c]/60 backdrop-blur-sm border border-[#40434E]/40 rounded-2xl overflow-hidden hover:border-[#F3C77E]/30 transition-all duration-300"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[#40434E]/10 transition-colors duration-200"
                            >
                                <h3 className="font-semibold text-[#FFFFFA] pr-4">
                                    {faq.question}
                                </h3>
                                <div className="shrink-0 text-[#F3C77E] transition-transform duration-200">
                                    {openIndex === index ? (
                                        <ChevronUp size={20} />
                                    ) : (
                                        <ChevronDown size={20} />
                                    )}
                                </div>
                            </button>

                            {openIndex === index && (
                                <div className="px-6 pb-5">
                                    <div className="pt-2 border-t border-[#40434E]/30">
                                        <p className="text-[#d6d6d6] leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Support CTA */}
                <div className="mt-16 text-center bg-gradient-to-r from-[#702632]/10 via-[#F3C77E]/10 to-[#702632]/10 rounded-2xl p-8 border border-[#F3C77E]/20">
                    <h3 className="text-xl font-bold text-[#FFFFFA] mb-3">
                        Still Have Questions?
                    </h3>
                    <p className="text-[#d6d6d6] mb-6">
                        Our support team responds within 2 hours during business hours
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/login"
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black font-bold hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            🚀 Get Started Now
                        </Link>
                        <a
                            href="mailto:support@scandish.ca"
                            className="px-6 py-3 rounded-xl border border-[#40434E]/40 text-[#FFFFFA] hover:border-[#F3C77E]/50 transition-colors duration-200 flex items-center gap-2"
                        >
                            📧 Email Support
                        </a>
                        <a
                            href="/help"
                            className="px-6 py-3 rounded-xl border border-[#40434E]/40 text-[#FFFFFA] hover:border-[#F3C77E]/50 transition-colors duration-200 flex items-center gap-2"
                        >
                            📚 Help Center
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

