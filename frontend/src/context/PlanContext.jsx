import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabaseClient";

const PlanContext = createContext();

const PLAN_FEATURES = {
    free: {
        maxMenus: 1,
        maxItems: 3,
        removeWatermark: false,
        photoUploads: false,
        analytics: false,
        customBranding: false,
        aiInsights: false,
        bulkImport: false,
        locations: false,
        templates: false,
        priority: 'low',
        description: 'Perfect for getting started'
    },
    starter: {
        maxMenus: 5,
        maxItems: -1, // unlimited
        removeWatermark: true,
        photoUploads: true,
        analytics: true,
        customBranding: true,
        aiInsights: false,
        bulkImport: false,
        locations: true,
        templates: true,
        priority: 'medium',
        description: 'Great for growing restaurants'
    },
    pro: {
        maxMenus: -1, // unlimited
        maxItems: -1, // unlimited
        removeWatermark: true,
        photoUploads: true,
        analytics: true,
        customBranding: true,
        aiInsights: true,
        bulkImport: true,
        locations: true,
        templates: true,
        priority: 'high',
        description: 'Everything you need to succeed'
    }
};

export function PlanProvider({ children }) {
    const { user } = useAuth();
    const [userPlan, setUserPlan] = useState('free');
    const [planLoading, setPlanLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        if (!user) {
            setUserPlan('free');
            setPlanLoading(false);
            return;
        }

        const fetchUserPlan = async () => {
            try {
                // Get user plan from database
                const { data: userData, error } = await supabase
                    .from('users')
                    .select('plan, stripe_customer_id')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching user plan:', error);
                    setUserPlan('free');
                } else {
                    const plan = userData?.plan || 'free';
                    setUserPlan(plan);

                    // If user has a Stripe customer ID, fetch subscription details
                    if (userData?.stripe_customer_id) {
                        try {
                            const response = await fetch('/api/billing/subscription', {
                                headers: {
                                    'Authorization': `Bearer ${user.id || ''}`
                                }
                            });

                            if (response.ok) {
                                const subscriptionData = await response.json();
                                setSubscription(subscriptionData);
                            }
                        } catch (subscriptionError) {
                            console.error('Failed to fetch subscription:', subscriptionError);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user plan:', error);
                setUserPlan('free');
            } finally {
                setPlanLoading(false);
            }
        };

        fetchUserPlan();
    }, [user]);

    const features = PLAN_FEATURES[userPlan] || PLAN_FEATURES.free;

    const hasFeature = (featureName) => {
        return features[featureName] === true;
    };

    const canCreateMenu = (currentMenuCount) => {
        if (features.maxMenus === -1) return true; // unlimited
        return currentMenuCount < features.maxMenus;
    };

    const getMenuLimit = () => {
        return features.maxMenus === -1 ? 'Unlimited' : features.maxMenus;
    };

    const canAddItem = (currentItemCount) => {
        if (features.maxItems === -1) return true; // unlimited
        return currentItemCount < features.maxItems;
    };

    const getItemLimit = () => {
        return features.maxItems === -1 ? 'Unlimited' : features.maxItems;
    };

    const upgradeTo = (targetPlan) => {
        // Redirect to pricing page with plan preselected
        const planUrls = {
            starter: 'https://whop.com/checkout/plan_9dfgdFgWDo0yh?d2c=true',
            pro: 'https://whop.com/checkout/plan_ABC123XYZ?d2c=true' // Replace with actual Whop Pro link
        };

        // Open Whop checkout in new tab
        if (planUrls[targetPlan]) {
            window.open(planUrls[targetPlan], '_blank');
        } else {
            // Fallback to pricing section on landing page
            window.location.href = '/#pricing';
        }
    };

    const refreshPlan = async () => {
        // Refresh plan data after upgrade
        if (user?.id) {
            setPlanLoading(true);
            try {
                const { data: userData, error } = await supabase
                    .from('users')
                    .select('plan, stripe_customer_id')
                    .eq('id', user.id)
                    .single();

                if (!error && userData?.plan) {
                    setUserPlan(userData.plan);
                }
            } catch (error) {
                console.error('Error refreshing plan:', error);
            } finally {
                setPlanLoading(false);
            }
        }
    };

    const value = {
        userPlan,
        features,
        subscription,
        planLoading,
        hasFeature,
        canCreateMenu,
        getMenuLimit,
        canAddItem,
        getItemLimit,
        upgradeTo,
        refreshPlan,
        // Plan hierarchy helpers
        isPro: userPlan === 'pro',
        isStarter: userPlan === 'starter',
        isFree: userPlan === 'free',
        isPaid: userPlan === 'starter' || userPlan === 'pro'
    };

    return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
    const context = useContext(PlanContext);
    if (!context) {
        throw new Error('usePlan must be used within a PlanProvider');
    }
    return context;
}


