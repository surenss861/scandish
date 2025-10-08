import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Star, Zap } from 'lucide-react';
import { usePlan } from '../context/PlanContext';

const PlanRestriction = ({
    feature,
    children,
    upgradeMessage = null,
    showUpgradeButton = true
}) => {
    const { userPlan, features, hasFeature } = usePlan();

    // If user has the feature, show the content
    if (hasFeature(feature)) {
        return children;
    }

    // Get feature info
    const getFeatureInfo = (featureName) => {
        const featureMap = {
            removeWatermark: {
                name: 'Remove Watermarks',
                description: 'Get a clean, professional menu without watermarks',
                icon: Zap,
                requiredPlan: 'starter'
            },
            photoUploads: {
                name: 'Photo Uploads',
                description: 'Add beautiful photos to your menu items',
                icon: Star,
                requiredPlan: 'starter'
            },
            analytics: {
                name: 'Advanced Analytics',
                description: 'Detailed insights into customer behavior and menu performance',
                icon: Crown,
                requiredPlan: 'pro'
            },
            customBranding: {
                name: 'Custom Branding',
                description: 'Full control over colors, fonts, and design',
                icon: Crown,
                requiredPlan: 'pro'
            },
            aiInsights: {
                name: 'AI Insights',
                description: 'Smart recommendations powered by artificial intelligence',
                icon: Crown,
                requiredPlan: 'pro'
            },
            bulkImport: {
                name: 'Bulk Import',
                description: 'Import hundreds of menu items at once from CSV',
                icon: Crown,
                requiredPlan: 'pro'
            }
        };

        return featureMap[featureName] || {
            name: 'Premium Feature',
            description: 'This feature requires a paid plan',
            icon: Lock,
            requiredPlan: 'starter'
        };
    };

    const featureInfo = getFeatureInfo(feature);
    const Icon = featureInfo.icon;

    const getPlanColor = (plan) => {
        switch (plan) {
            case 'starter': return 'from-[#F3C77E] to-[#d6a856]';
            case 'pro': return 'from-[#912F40] to-[#F3C77E]';
            default: return 'from-[#40434E] to-[#2a2a2a]';
        }
    };

    const getPlanIcon = (plan) => {
        switch (plan) {
            case 'starter': return '⭐';
            case 'pro': return '🚀';
            default: return '🍽️';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
        >
            {/* Blurred content */}
            <div className="filter blur-sm pointer-events-none select-none">
                {children}
            </div>

            {/* Overlay with upgrade prompt */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg"
            >
                <div className={`bg-gradient-to-r ${getPlanColor(featureInfo.requiredPlan)} p-6 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl max-w-sm mx-4`}>
                    <div className="text-center">
                        {/* Feature Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-white/20 rounded-full">
                                <Icon className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        {/* Feature Info */}
                        <h3 className="text-lg font-bold text-white mb-2">
                            {featureInfo.name}
                        </h3>
                        <p className="text-white/80 text-sm mb-4">
                            {upgradeMessage || featureInfo.description}
                        </p>

                        {/* Required Plan */}
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <span className="text-white/60 text-sm">Requires:</span>
                            <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full">
                                <span className="text-lg">{getPlanIcon(featureInfo.requiredPlan)}</span>
                                <span className="text-white font-semibold text-sm capitalize">
                                    {featureInfo.requiredPlan} Plan
                                </span>
                            </div>
                        </div>

                        {/* Upgrade Button */}
                        {showUpgradeButton && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    // Navigate to account upgrade tab
                                    window.location.href = '/dashboard?section=account&tab=upgrade';
                                }}
                                className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
                            >
                                Upgrade to {featureInfo.requiredPlan === 'starter' ? 'Starter' : 'Pro'}
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PlanRestriction;
