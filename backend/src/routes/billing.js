const express = require('express');
const router = express.Router();
const { supabase } = require('../services/supabase');
const { requireAuth } = require('../middleware/auth');

async function ensureUserRecord(user) {
    // Inserts a row into public.users if missing
    if (!user?.id) return;
    const email = user.email || null;
    await supabase
        .from('users')
        .upsert(
            { id: user.id, email, updated_at: new Date().toISOString() },
            { onConflict: 'id' }
        );
}

/**
 * Get Current Subscription
 * GET /api/billing/subscription
 */
router.get('/subscription', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Ensure user exists in public.users
        await ensureUserRecord(req.user);

        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !subscription) {
            // No subscription found, return free tier
            return res.json({
                plan: 'free',
                status: 'active',
                features: {
                    maxMenus: 1,
                    removeWatermark: false,
                    photoUploads: false,
                    analytics: false
                }
            });
        }

        // Determine features based on plan
        const features = getFeaturesByPlan(subscription.plan);

        res.json({ plan: subscription.plan, status: subscription.status, features });
    } catch (error) {
        console.error('Failed to get subscription:', error);
        res.status(500).json({ error: 'Failed to retrieve subscription' });
    }
});

/**
 * Update Subscription Plan (for Whop webhook integration)
 * POST /api/billing/update-subscription
 */
router.post('/update-subscription', requireAuth, async (req, res) => {
    try {
        const { plan, status = 'active' } = req.body;
        const userId = req.user.id;
        if (!plan) return res.status(400).json({ error: 'plan is required' });

        await ensureUserRecord(req.user);

        // Update or create subscription
        const { error } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                plan: plan,
                status: status,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Failed to update subscription:', error);
            return res.status(500).json({ error: 'Failed to update subscription' });
        }

        res.json({ success: true, plan, status });
    } catch (error) {
        console.error('Subscription update failed:', error);
        res.status(500).json({ error: 'Failed to update subscription' });
    }
});

/**
 * Cancel Subscription
 * POST /api/billing/cancel-subscription
 */
router.post('/cancel-subscription', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Update subscription status to cancelled
        const { error } = await supabase
            .from('subscriptions')
            .update({
                plan: 'free',
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (error) {
            console.error('Failed to cancel subscription:', error);
            return res.status(500).json({ error: 'Failed to cancel subscription' });
        }

        res.json({ success: true, message: 'Subscription cancelled successfully' });
    } catch (error) {
        console.error('Subscription cancellation failed:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

/**
 * TEMPORARY: Set User to Pro Plan (for testing) - protected
 * POST /api/billing/set-pro
 */
router.post('/set-pro', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        await ensureUserRecord(req.user);

        // Set user to Pro plan
        const { error } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                plan: 'pro',
                status: 'active',
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Failed to set Pro plan:', error);
            return res.status(500).json({ error: 'Failed to set Pro plan' });
        }

        res.json({ success: true, message: 'User set to Pro plan successfully' });
    } catch (error) {
        console.error('Set Pro plan failed:', error);
        res.status(500).json({ error: 'Failed to set Pro plan' });
    }
});

// Helper function to determine features by plan
function getFeaturesByPlan(plan) {
    const planFeatures = {
        free: {
            maxMenus: 1,
            removeWatermark: false,
            photoUploads: false,
            analytics: false,
            customBranding: false,
            priority: 'low'
        },
        starter: {
            maxMenus: 5,
            removeWatermark: true,
            photoUploads: true,
            analytics: false,
            customBranding: false,
            priority: 'medium'
        },
        pro: {
            maxMenus: -1, // unlimited
            removeWatermark: true,
            photoUploads: true,
            analytics: true,
            customBranding: true,
            priority: 'high',
            prioritySupport: true,
            apiAccess: true
        }
    };

    return planFeatures[plan] || planFeatures.free;
}

module.exports = router;