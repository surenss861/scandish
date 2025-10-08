import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock, ArrowRight } from 'lucide-react';
import { usePlan } from '../context/PlanContext';

export default function PlanUpgradePrompt({
    feature,
    requiredPlan = 'starter',
    children,
    className = "",
    showIcon = true
}) {
    const { userPlan, upgradeTo } = usePlan();

    const isRestricted = userPlan === 'free' && requiredPlan !== 'free';

    if (!isRestricted) {
        return children;
    }

    const planNames = {
        starter: 'Starter',
        pro: 'Pro'
    };

    const featureDescriptions = {
        branding: 'Custom Branding',
        photos: 'Photo Uploads',
        analytics: 'Analytics',
        locations: 'Locations',
        templates: 'Templates',
        watermark: 'Watermark Removal',
        items: 'More Menu Items'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative ${className}`}
        >
            {/* Blurred content */}
            <div className="filter blur-sm pointer-events-none">
                {children}
            </div>

            {/* Upgrade overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#0f0e0c] to-[#1a1a1a] border border-[#F3C77E]/30 rounded-2xl p-6 max-w-sm mx-4 text-center shadow-2xl"
                >
                    {showIcon && (
                        <div className="w-16 h-16 bg-gradient-to-br from-[#F3C77E] to-[#d6a856] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Crown className="text-[#080705]" size={24} />
                        </div>
                    )}

                    <h3 className="text-xl font-bold text-white mb-2">
                        Upgrade Required
                    </h3>

                    <p className="text-[#a7a7a7] mb-4">
                        {featureDescriptions[feature] || 'This feature'} requires {planNames[requiredPlan]} plan
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => upgradeTo(requiredPlan)}
                            className="w-full bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-[#080705] font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            Upgrade to {planNames[requiredPlan]}
                            <ArrowRight size={16} />
                        </button>

                        <p className="text-xs text-[#666]">
                            Starting at ${requiredPlan === 'starter' ? '9' : '29'}/month
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export function PhotoUpgradePrompt({ children }) {
    return (
        <PlanUpgradePrompt feature="photos" requiredPlan="starter">
            {children}
        </PlanUpgradePrompt>
    );
}

export function AnalyticsUpgradePrompt({ children }) {
    return (
        <PlanUpgradePrompt feature="analytics" requiredPlan="starter">
            {children}
        </PlanUpgradePrompt>
    );
}

export function CustomBrandingUpgradePrompt({ children }) {
    return (
        <PlanUpgradePrompt feature="branding" requiredPlan="starter">
            {children}
        </PlanUpgradePrompt>
    );
}

export function LocationsUpgradePrompt({ children }) {
    return (
        <PlanUpgradePrompt feature="locations" requiredPlan="starter">
            {children}
        </PlanUpgradePrompt>
    );
}

export function TemplatesUpgradePrompt({ children }) {
    return (
        <PlanUpgradePrompt feature="templates" requiredPlan="starter">
            {children}
        </PlanUpgradePrompt>
    );
}

export function WatermarkUpgradePrompt({ children }) {
    return (
        <PlanUpgradePrompt feature="watermark" requiredPlan="starter">
            {children}
        </PlanUpgradePrompt>
    );
}

export function ItemLimitUpgradePrompt({ children, currentCount, maxAllowed }) {
    return (
        <PlanUpgradePrompt feature="items" requiredPlan="starter">
            {children}
        </PlanUpgradePrompt>
    );
}
