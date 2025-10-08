import React from "react";
import { Link } from "react-router-dom";
import { LogoWithText } from "../components/Logo";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-[#080705] text-[#FFFFFA]">
            <header className="border-b border-[#40434E]/40 bg-[#13110e]/80">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <Link to="/" className="inline-block">
                        <LogoWithText />
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="prose prose-invert max-w-none">
                    <h1 className="text-3xl font-bold text-[#FFFFFA] mb-8">Privacy Policy</h1>
                    <p className="text-[#a7a7a7] mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[#F3C77E] mb-4">What We Collect</h2>
                        <div className="text-[#d6d6d6] space-y-3">
                            <p><strong>Account Information:</strong> Email address, restaurant name, and billing details for subscription management.</p>
                            <p><strong>Menu Data:</strong> Menu items, prices, descriptions, and photos you upload to create your digital menus.</p>
                            <p><strong>Analytics:</strong> Anonymous usage data like menu views and item clicks to help you understand customer preferences.</p>
                            <p><strong>Payment Information:</strong> Processed securely through Whop. We never store your credit card details.</p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[#F3C77E] mb-4">How We Use Your Data</h2>
                        <div className="text-[#d6d6d6] space-y-3">
                            <p>• Provide and improve our digital menu service</p>
                            <p>• Generate QR codes and host your public menu pages</p>
                            <p>• Process payments and manage your subscription</p>
                            <p>• Send important service updates (no spam, ever)</p>
                            <p>• Provide customer support when you need help</p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[#F3C77E] mb-4">Data Security</h2>
                        <div className="text-[#d6d6d6] space-y-3">
                            <p>Your data is protected with bank-level security:</p>
                            <p>• <strong>SSL encryption</strong> for all data transmission</p>
                            <p>• <strong>SOC 2 compliant</strong> hosting on Supabase</p>
                            <p>• <strong>Regular backups</strong> to prevent data loss</p>
                            <p>• <strong>Access controls</strong> - only you can see your menu data</p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[#F3C77E] mb-4">Your Rights</h2>
                        <div className="text-[#d6d6d6] space-y-3">
                            <p>You have complete control over your data:</p>
                            <p>• <strong>Access:</strong> Download all your menu data anytime</p>
                            <p>• <strong>Update:</strong> Modify or correct your information</p>
                            <p>• <strong>Delete:</strong> Permanently remove your account and data</p>
                            <p>• <strong>Portability:</strong> Export your menu in standard formats</p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[#F3C77E] mb-4">Contact Us</h2>
                        <div className="text-[#d6d6d6]">
                            <p>Questions about your privacy? We're here to help:</p>
                            <p className="mt-3">
                                Email: <a href="mailto:privacy@scandish.ca" className="text-[#F3C77E] hover:underline">privacy@scandish.ca</a><br />
                                Address: Scandish, Inc., 123 Tech Street, San Francisco, CA 94105
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="border-t border-[#40434E]/40 py-8">
                <div className="max-w-4xl mx-auto px-6 text-center text-sm text-[#a7a7a7]">
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link to="/terms" className="hover:text-[#F3C77E] transition-colors">Terms of Service</Link>
                        <Link to="/privacy" className="hover:text-[#F3C77E] transition-colors">Privacy Policy</Link>
                        <Link to="/help" className="hover:text-[#F3C77E] transition-colors">Help Center</Link>
                        <a href="mailto:support@scandish.ca" className="hover:text-[#F3C77E] transition-colors">Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

