const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { priceId, userId, userEmail, planId } = req.body;

        if (!priceId || !userId || !userEmail) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        let actualPriceId = priceId;

        // If it's a product ID (prod_), get the default price
        if (priceId.startsWith('prod_')) {
            const product = await stripe.products.retrieve(priceId);
            const prices = await stripe.prices.list({
                product: priceId,
                active: true,
                type: 'recurring'
            });

            if (prices.data.length === 0) {
                return res.status(400).json({ error: 'No active prices found for this product' });
            }

            // Use the first (default) price
            actualPriceId = prices.data[0].id;
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: actualPriceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/dashboard?section=billing&success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard?section=upgrade&cancelled=true`,
            customer_email: userEmail,
            metadata: {
                userId: userId,
                planId: planId
            },
            subscription_data: {
                metadata: {
                    userId: userId,
                    planId: planId
                }
            }
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Webhook to handle successful payments
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Checkout session completed:', session.id);

            // Update user plan in database
            try {
                const { supabase } = require('../lib/supabaseClient');
                const { userId, planId } = session.metadata;

                await supabase
                    .from('users')
                    .update({
                        plan: planId,
                        stripe_customer_id: session.customer,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                console.log(`User ${userId} upgraded to ${planId} plan`);
            } catch (dbError) {
                console.error('Error updating user plan:', dbError);
            }
            break;

        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            console.log('Invoice payment succeeded:', invoice.id);
            break;

        case 'invoice.payment_failed':
            const failedInvoice = event.data.object;
            console.log('Invoice payment failed:', failedInvoice.id);
            break;

        case 'customer.subscription.updated':
            const subscription = event.data.object;
            console.log('Subscription updated:', subscription.id);

            // Update user plan based on subscription status
            try {
                const { supabase } = require('../lib/supabaseClient');
                const customerId = subscription.customer;

                // Determine plan based on subscription
                let plan = 'free';
                if (subscription.status === 'active') {
                    // Get subscription details to determine plan
                    const subscriptionData = await stripe.subscriptions.retrieve(subscription.id);
                    const priceId = subscriptionData.items.data[0].price.id;

                    // Map price ID to plan
                    if (priceId === 'price_1SCSYcIrWFeHqnZlc0NbLtZC') {
                        plan = 'starter';
                    } else if (priceId === 'price_1SCSZPIrWFeHqnZl8rTrEUkg') {
                        plan = 'pro';
                    }
                }

                await supabase
                    .from('users')
                    .update({
                        plan: plan,
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_customer_id', customerId);

                console.log(`Customer ${customerId} plan updated to ${plan}`);
            } catch (dbError) {
                console.error('Error updating subscription plan:', dbError);
            }
            break;

        case 'customer.subscription.deleted':
            const cancelledSubscription = event.data.object;
            console.log('Subscription cancelled:', cancelledSubscription.id);

            // Downgrade user to free plan
            try {
                const { supabase } = require('../lib/supabaseClient');
                const customerId = cancelledSubscription.customer;

                await supabase
                    .from('users')
                    .update({
                        plan: 'free',
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_customer_id', customerId);

                console.log(`Customer ${customerId} downgraded to free plan`);
            } catch (dbError) {
                console.error('Error downgrading user plan:', dbError);
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// Get customer portal session
router.post('/create-portal-session', async (req, res) => {
    try {
        const { customerId } = req.body;

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.FRONTEND_URL}/dashboard?section=billing`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
});

module.exports = router;
