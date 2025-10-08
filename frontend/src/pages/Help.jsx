import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Book, MessageCircle, Mail, Phone, ExternalLink } from "lucide-react";
import { LogoWithText } from "../components/Logo";

const helpCategories = [
    {
        title: "Getting Started",
        icon: "🚀",
        articles: [
            { title: "Setting up your first menu", time: "5 min read" },
            { title: "Adding menu items and categories", time: "3 min read" },
            { title: "Generating and printing QR codes", time: "2 min read" },
            { title: "Publishing your menu", time: "1 min read" }
        ]
    },
    {
        title: "Menu Management",
        icon: "🍽️",
        articles: [
            { title: "Updating prices and descriptions", time: "2 min read" },
            { title: "Adding photos to menu items", time: "4 min read" },
            { title: "Organizing items with drag & drop", time: "3 min read" },
            { title: "Managing multiple menus", time: "5 min read" }
        ]
    },
    {
        title: "Billing & Plans",
        icon: "💳",
        articles: [
            { title: "Understanding our pricing plans", time: "3 min read" },
            { title: "Upgrading to Pro or Business", time: "2 min read" },
            { title: "Managing your subscription", time: "4 min read" },
            { title: "Canceling your account", time: "2 min read" }
        ]
    },
    {
        title: "Analytics & Insights",
        icon: "📊",
        articles: [
            { title: "Understanding menu analytics", time: "6 min read" },
            { title: "Tracking popular items", time: "4 min read" },
            { title: "Mobile vs desktop usage", time: "3 min read" },
            { title: "Exporting analytics data", time: "2 min read" }
        ]
    }
];

const quickActions = [
    {
        title: "Live Chat Support",
        description: "Get instant help from our team",
        icon: MessageCircle,
        action: "Start Chat",
        available: "Mon-Fri, 9am-6pm PT"
    },
    {
        title: "Email Support",
        description: "Detailed help via email",
        icon: Mail,
        action: "Send Email",
        available: "Response within 4 hours"
    },
    {
        title: "Schedule a Call",
        description: "Personal onboarding session",
        icon: Phone,
        action: "Book Call",
        available: "Free for Pro+ users"
    }
];

export default function Help() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen bg-[#080705] text-[#FFFFFA]">
            <header className="border-b border-[#40434E]/40 bg-[#13110e]/80">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <Link to="/" className="inline-block">
                        <LogoWithText />
                    </Link>
                </div>
            </header>

            {/* Hero section */}
            <section className="py-16 text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#FFFFFA] mb-4">
                        How can we help you?
                    </h1>
                    <p className="text-lg text-[#d6d6d6] mb-8">
                        Find answers, tutorials, and support for your QuickMenu
                    </p>

                    {/* Search bar */}
                    <div className="relative max-w-lg mx-auto">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#a7a7a7]" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for help articles..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50"
                        />
                    </div>
                </div>
            </section>

            {/* Quick actions */}
            <section className="py-12 bg-gradient-to-r from-[#702632]/5 via-transparent to-[#F3C77E]/5">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-[#FFFFFA] text-center mb-8">
                        Get Support Now
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {quickActions.map((action, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#0f0e0c]/80 backdrop-blur-sm border border-[#40434E]/40 rounded-2xl p-6 hover:border-[#F3C77E]/30 hover:bg-[#0f0e0c]/90 transition-all duration-300 hover:scale-105"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#F3C77E] to-[#d6a856] rounded-full flex items-center justify-center shadow-lg">
                                        <action.icon className="text-[#080705]" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#FFFFFA]">{action.title}</h3>
                                        <p className="text-xs text-[#F3C77E]">{action.available}</p>
                                    </div>
                                </div>
                                <p className="text-[#d6d6d6] mb-4 text-sm">{action.description}</p>
                                <button className="w-full px-4 py-2 rounded-xl bg-[#40434E]/20 border border-[#40434E]/40 text-[#FFFFFA] hover:border-[#F3C77E]/50 hover:bg-[#F3C77E]/10 transition-colors duration-200">
                                    {action.action}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Help categories */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-[#FFFFFA] text-center mb-12">
                        Browse Help Topics
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {helpCategories.map((category, idx) => (
                            <div
                                key={idx}
                                className="bg-[#0f0e0c]/60 backdrop-blur-sm border border-[#40434E]/40 rounded-2xl p-6 hover:border-[#F3C77E]/30 transition-colors duration-300"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-2xl">{category.icon}</span>
                                    <h3 className="text-xl font-semibold text-[#FFFFFA]">{category.title}</h3>
                                </div>

                                <div className="space-y-3">
                                    {category.articles.map((article, articleIdx) => (
                                        <a
                                            key={articleIdx}
                                            href="#"
                                            className="group block p-3 rounded-lg hover:bg-[#40434E]/10 transition-colors duration-200"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <Book className="text-[#F3C77E] shrink-0" size={16} />
                                                    <span className="text-[#d6d6d6] group-hover:text-[#FFFFFA] transition-colors">
                                                        {article.title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-[#a7a7a7]">
                                                    <span>{article.time}</span>
                                                    <ExternalLink size={12} className="group-hover:text-[#F3C77E] transition-colors" />
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact section */}
            <section className="py-16 bg-gradient-to-r from-[#702632]/10 via-[#F3C77E]/10 to-[#702632]/10">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold text-[#FFFFFA] mb-4">
                        Still Need Help?
                    </h2>
                    <p className="text-[#d6d6d6] mb-8">
                        Our team is here to help you succeed with QuickMenu
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="mailto:support@quickmenu.app"
                            className="px-6 py-3 rounded-xl bg-[#F3C77E] text-[#080705] font-semibold hover:bg-[#d6a856] transition-colors duration-200 flex items-center gap-2"
                        >
                            <Mail size={18} />
                            Email Support
                        </a>
                        <Link
                            to="/dashboard"
                            className="px-6 py-3 rounded-xl border border-[#40434E]/40 text-[#FFFFFA] hover:border-[#F3C77E]/50 transition-colors duration-200 flex items-center gap-2"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="border-t border-[#40434E]/40 py-8">
                <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[#a7a7a7]">
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link to="/terms" className="hover:text-[#F3C77E] transition-colors">Terms of Service</Link>
                        <Link to="/privacy" className="hover:text-[#F3C77E] transition-colors">Privacy Policy</Link>
                        <Link to="/help" className="hover:text-[#F3C77E] transition-colors">Help Center</Link>
                        <a href="mailto:support@quickmenu.app" className="hover:text-[#F3C77E] transition-colors">Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

