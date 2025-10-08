import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Zap, Star, Crown } from 'lucide-react';
import { usePlan } from '../context/PlanContext';

const FeatureUnlockNotification = () => {
    const { userPlan, features } = usePlan();
    const [showNotification, setShowNotification] = useState(false);
    const [unlockedFeatures, setUnlockedFeatures] = useState([]);

    useEffect(() => {
        // Check if user just upgraded
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');

        if (success === 'true') {
            // Show notification after a short delay
            setTimeout(() => {
                const newFeatures = getUnlockedFeatures(userPlan);
                if (newFeatures.length > 0) {
                    setUnlockedFeatures(newFeatures);
                    setShowNotification(true);

                    // Auto-hide after 10 seconds
                    setTimeout(() => {
                        setShowNotification(false);
                    }, 10000);
                }
            }, 3000);
        }
    }, [userPlan]);

    const getUnlockedFeatures = (plan) => {
        const featureMap = {
            starter: [
                { name: 'Photo Uploads', icon: Star, description: 'Add beautiful photos to your menus' },
                { name: 'Remove Watermarks', icon: Zap, description: 'Clean, professional menu appearance' },
                { name: 'Up to 5 Menus', icon: CheckCircle, description: 'Create multiple menus for different occasions' }
            ],
            pro: [
                { name: 'Advanced Analytics', icon: Zap, description: 'Detailed insights into customer behavior' },
                { name: 'Custom Branding', icon: Star, description: 'Full control over your menu design' },
                { name: 'AI Insights', icon: Crown, description: 'Smart recommendations powered by AI' },
                { name: 'Bulk Import', icon: CheckCircle, description: 'Import hundreds of items at once' },
                { name: 'Unlimited Menus', icon: Crown, description: 'Create as many menus as you need' }
            ]
        };

        return featureMap[plan] || [];
    };

    const getPlanIcon = (plan) => {
        switch (plan) {
            case 'starter': return '⭐';
            case 'pro': return '🚀';
            default: return '🍽️';
        }
    };

    const getPlanColor = (plan) => {
        switch (plan) {
            case 'starter': return 'from-[#F3C77E] to-[#d6a856]';
            case 'pro': return 'from-[#912F40] to-[#F3C77E]';
            default: return 'from-[#40434E] to-[#2a2a2a]';
        }
    };

    return (
        <AnimatePresence>
            {showNotification && (
                <motion.div
                    initial={{ opacity: 0, y: -100, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -100, scale: 0.8 }}
                    className="fixed top-4 right-4 z-50 max-w-md"
                >
                    <div className={`bg-gradient-to-r ${getPlanColor(userPlan)} p-6 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl`}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="text-2xl">{getPlanIcon(userPlan)}</div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        Welcome to {userPlan === 'starter' ? 'Starter' : 'Pro'} Plan!
                                    </h3>
                                    <p className="text-white/80 text-sm">Your features are now unlocked</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowNotification(false)}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Unlocked Features */}
                        <div className="space-y-3">
                            {unlockedFeatures.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <motion.div
                                        key={feature.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center space-x-3 bg-white/10 rounded-lg p-3"
                                    >
                                        <Icon className="w-5 h-5 text-white flex-shrink-0" />
                                        <div>
                                            <p className="text-white font-semibold text-sm">{feature.name}</p>
                                            <p className="text-white/70 text-xs">{feature.description}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-white/80 text-xs text-center">
                                Start exploring your new features in the dashboard!
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FeatureUnlockNotification;
