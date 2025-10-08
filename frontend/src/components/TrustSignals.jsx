import React from "react";
import { Shield, Zap, Users, Award } from "lucide-react";

const metrics = [
    { number: "500+", label: "Restaurants Served", icon: "🍽️" },
    { number: "50K+", label: "QR Code Scans", icon: "📱" },
    { number: "99.9%", label: "Uptime SLA", icon: "⚡" },
    { number: "4.9/5", label: "Customer Rating", icon: "⭐" }
];

const logos = [
    { name: "Tony's Pizza", slug: "tonys-pizza" },
    { name: "Café Luna", slug: "cafe-luna" },
    { name: "Sakura Sushi", slug: "sakura-sushi" },
    { name: "El Burrito", slug: "el-burrito" },
    { name: "Green Garden", slug: "green-garden" },
    { name: "The Wine Bar", slug: "wine-bar" }
];

export default function TrustSignals() {
    return (
        <section className="relative py-20 px-8 md:px-16 lg:px-32">
            {/* Background accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#702632]/5 via-transparent to-[#F3C77E]/5" />

            <div className="relative max-w-6xl mx-auto">
                {/* Trust metrics */}
                <div className="text-center mb-16">
                    <h2 className="text-sm font-semibold text-[#F3C77E] mb-3 tracking-wide uppercase">
                        Trusted by Restaurants Worldwide
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {metrics.map((metric, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="text-3xl mb-2 group-hover:animate-bounce">{metric.icon}</div>
                                <div className="text-3xl md:text-4xl font-bold text-[#FFFFFA] mb-1">
                                    {metric.number}
                                </div>
                                <div className="text-sm text-[#a7a7a7]">{metric.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security & reliability badges */}
                <div className="flex flex-wrap justify-center items-center gap-8 mb-16">
                    <div className="flex items-center gap-3 bg-[#40434E]/20 px-4 py-3 rounded-xl border border-[#40434E]/40">
                        <Shield className="text-[#F3C77E]" size={20} />
                        <div>
                            <div className="text-sm font-medium text-[#FFFFFA]">SSL Secured</div>
                            <div className="text-xs text-[#a7a7a7]">Bank-level encryption</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-[#40434E]/20 px-4 py-3 rounded-xl border border-[#40434E]/40">
                        <Zap className="text-[#F3C77E]" size={20} />
                        <div>
                            <div className="text-sm font-medium text-[#FFFFFA]">99.9% Uptime</div>
                            <div className="text-xs text-[#a7a7a7]">Powered by Supabase</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-[#40434E]/20 px-4 py-3 rounded-xl border border-[#40434E]/40">
                        <Users className="text-[#F3C77E]" size={20} />
                        <div>
                            <div className="text-sm font-medium text-[#FFFFFA]">GDPR Compliant</div>
                            <div className="text-xs text-[#a7a7a7]">Privacy protected</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-[#40434E]/20 px-4 py-3 rounded-xl border border-[#40434E]/40">
                        <Award className="text-[#F3C77E]" size={20} />
                        <div>
                            <div className="text-sm font-medium text-[#FFFFFA]">PCI Compliant</div>
                            <div className="text-xs text-[#a7a7a7]">Secure payments</div>
                        </div>
                    </div>
                </div>

                {/* Restaurant logos showcase */}
                <div className="text-center">
                    <p className="text-sm text-[#a7a7a7] mb-8">
                        Trusted by restaurants from food trucks to fine dining
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center opacity-60">
                        {logos.map((restaurant, idx) => (
                            <div
                                key={idx}
                                className="bg-[#40434E]/20 rounded-lg px-4 py-3 border border-[#40434E]/30 hover:border-[#F3C77E]/30 transition-colors"
                            >
                                <div className="text-xs font-medium text-[#d6d6d6] text-center">
                                    {restaurant.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ROI callout */}
                <div className="mt-16 text-center bg-gradient-to-r from-[#702632]/10 via-[#F3C77E]/10 to-[#702632]/10 rounded-2xl p-8 border border-[#F3C77E]/20">
                    <h3 className="text-2xl font-bold text-[#FFFFFA] mb-4">
                        Stop Reprinting Menus Forever
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-3xl font-bold text-[#F3C77E] mb-2">$200+</div>
                            <div className="text-sm text-[#a7a7a7]">Saved per month on printing</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[#F3C77E] mb-2">5 min</div>
                            <div className="text-sm text-[#a7a7a7]">To update entire menu</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[#F3C77E] mb-2">∞</div>
                            <div className="text-sm text-[#a7a7a7]">Updates with one QR</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

