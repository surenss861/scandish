import React from "react";
import { Link } from "react-router-dom";
import { LogoWithText } from "../components/Logo";

export default function Terms() {
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
                    <h1 className="text-3xl font-bold text-[#FFFFFA] mb-8">Terms of Service</h1>
                    <p className="text-[#a7a7a7] mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[#F3C77E] mb-4">Service Description</h2>
                        <div className="text-[#d6d6d6] space-y-3">
                            <p>QuickMenu provides digital menu management services for restaurants, including:</p>
                            <p>• QR code generation for contactless menu access</p>
                            <p>• Cloud-hosted menu pages with real-time updates</p>
                            <p>• Analytics and insights on menu performance</p>
                            <p>• Subscription billing and account management</p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[#F3C77E] mb-4">Acceptable Use</h2>
                        <div className="text-[#d6d6d6] space-y-3">
                            <p>You agree to use QuickMenu only for legitimate restaurant menu purposes. Prohibited uses include:</p>
                            <p>• Uploading harmful, illegal, or inappropriate content</p>
                            <p>• Attempting to circumvent billing or usage limits</p>
                            <p>• Using the service to spam or harass customers</p>
                            <p>• Violating any applicable laws or regulations</p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[#F3C77E] mb-4">Billing & Subscriptions</h2>
                        <div className="text-[#d6d6d6] space-y-3">
                            <p><strong>Free Tier:</strong> Limited to 1 menu with QuickMenu watermark</p>
                            <p><strong>Pro ($9/month):</strong> Up to 5 menus, photo uploads, remove watermark</p>
                            <p><strong>Business ($29/month):</strong> Unlimited menus, analytics, priority support</p>
                            <p>• All plans include 7-day free trial</p>
                            <p>• Cancel anytime - no long-term contracts</p>
                            <p>• Refunds processed within 5-7 business days</p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[#F3C77E] mb-4">Service Availability</h2>
                        <div className="text-[#d6d6d6] space-y-3">
                            <p>We strive for 99.9% uptime but cannot guarantee uninterrupted service:</p>
                            <p>• Scheduled maintenance will be announced 24 hours in advance</p>
                            <p>• Emergency maintenance may occur with minimal notice</p>
                            <p>• Service credits may be issued for extended outages</p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[#F3C77E] mb-4">Data Ownership</h2>
                        <div className="text-[#d6d6d6] space-y-3">
                            <p>You retain full ownership of your menu content:</p>
                            <p>• Menu items, descriptions, and photos remain your property</p>
                            <p>• You can export your data at any time</p>
                            <p>• We may use anonymized data for service improvements</p>
                            <p>• Account deletion removes all your data within 30 days</p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[#F3C77E] mb-4">Limitation of Liability</h2>
                        <div className="text-[#d6d6d6] space-y-3">
                            <p>QuickMenu's liability is limited to the amount you've paid in the last 12 months. We are not responsible for:</p>
                            <p>• Lost revenue due to service interruptions</p>
                            <p>• Third-party integrations or payment processors</p>
                            <p>• Customer disputes related to menu content</p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-[#F3C77E] mb-4">Contact Information</h2>
                        <div className="text-[#d6d6d6]">
                            <p>For questions about these terms:</p>
                            <p className="mt-3">
                                Email: <a href="mailto:legal@quickmenu.app" className="text-[#F3C77E] hover:underline">legal@quickmenu.app</a><br />
                                Support: <a href="mailto:support@quickmenu.app" className="text-[#F3C77E] hover:underline">support@quickmenu.app</a><br />
                                Address: QuickMenu, Inc., 123 Tech Street, San Francisco, CA 94105
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
                        <a href="mailto:support@quickmenu.app" className="hover:text-[#F3C77E] transition-colors">Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

