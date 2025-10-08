import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Zap } from "lucide-react";

const plans = {
    free: {
        name: "Free",
        price: 0,
        period: "",
        description: "Perfect for testing Scandish",
        features: [
            "1 Menu",
            "Unlimited Updates",
            "QR Code Included",
            "Scandish Watermark"
        ],
        limitations: [
            "No custom branding",
            "No images",
            "No analytics"
        ],
        href: "/signup", // Free plan → signup route
        icon: "🍽️"
    },
    starter: {
        name: "Starter",
        price: 9,
        period: "month",
        description: "For growing restaurants",
        features: [
            "5 Menus",
            "Remove Watermark",
            "Photo Uploads",
            "Custom Branding",
            "Basic Analytics"
        ],
        href: "https://whop.com/checkout/plan_9dfgdFgWDo0yh?d2c=true",
        icon: "👑",
        popular: true
    },
    pro: {
        name: "Pro",
        price: 29,
        period: "month",
        description: "For restaurant chains",
        features: [
            "Unlimited Menus",
            "Advanced Analytics",
            "Priority Support",
            "Custom Domain",
            "API Access"
        ],
        href: "https://whop.com/checkout/plan_PNrOKuTP2C51K?d2c=true",
        icon: "🚀"
    }
};

export default function BillingManager({ currentPlan = "free" }) {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = (planKey) => {
        const plan = plans[planKey];
        if (plan.href.startsWith('http')) {
            // External Whop checkout - open in new tab
            window.open(plan.href, '_blank');
        } else {
            // Internal route - navigate normally
            window.location.href = plan.href;
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Choose Your Plan
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Upgrade anytime. Cancel anytime. No hidden fees.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(plans).map(([key, plan]) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`relative rounded-2xl border p-6 shadow-sm transition-all hover:shadow-lg ${plan.popular
                            ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                            : 'border-gray-200 dark:border-gray-700'
                            } ${currentPlan === key
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : 'bg-white dark:bg-gray-800'
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    Most Popular
                                </span>
                            </div>
                        )}

                        {currentPlan === key && (
                            <div className="absolute -top-3 right-4">
                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                    <Check size={14} />
                                    Current Plan
                                </span>
                            </div>
                        )}

                        <div className="text-center mb-6">
                            <div className="text-3xl mb-2">{plan.icon}</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {plan.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                {plan.description}
                            </p>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                    ${plan.price}
                                </span>
                                {plan.period && (
                                    <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                                )}
                            </div>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <Check className="text-green-500 shrink-0" size={16} />
                                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                            {plan.limitations?.map((limitation, idx) => (
                                <li key={idx} className="flex items-center gap-3 opacity-60">
                                    <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center shrink-0">
                                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                    </div>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm line-through">
                                        {limitation}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-auto">
                            {currentPlan === key ? (
                                key === 'free' ? (
                                    <button
                                        onClick={() => handleUpgrade('starter')}
                                        disabled={loading}
                                        className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        Upgrade to Starter
                                    </button>
                                ) : (
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg px-4 py-3 font-medium text-center">
                                        Current Plan
                                    </div>
                                )
                            ) : (
                                <button
                                    onClick={() => handleUpgrade(key)}
                                    disabled={loading || key === 'free'}
                                    className={`w-full rounded-lg px-4 py-3 font-medium transition-colors disabled:opacity-50 ${plan.popular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                                        }`}
                                >
                                    {loading ? 'Processing...' : key === 'free' ? 'Current Plan' : `Upgrade to ${plan.name}`}
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>All plans include a 7-day free trial. Cancel anytime.</p>
                <p className="mt-1">
                    Need help? <a href="mailto:support@scandish.ca" className="text-blue-600 dark:text-blue-400 hover:underline">Contact support</a>
                </p>
            </div>
        </div>
    );
}