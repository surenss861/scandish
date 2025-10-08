#!/usr/bin/env node

/**
 * Simple test script to verify Stripe integration
 * Run with: node test-stripe.js
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeIntegration() {
    console.log('🧪 Testing Stripe Integration...\n');

    try {
        // Test 1: Verify API key
        console.log('1. Testing Stripe API key...');
        const account = await stripe.accounts.retrieve();
        console.log(`✅ Connected to Stripe account: ${account.display_name || account.id}\n`);

        // Test 2: Check products exist
        console.log('2. Checking products...');

        const starterProduct = await stripe.products.retrieve('prod_T8k2qhwHZnunO8');
        console.log(`✅ Starter Plan found: ${starterProduct.name}`);

        const proProduct = await stripe.products.retrieve('prod_T8k3mCxHQVKP8y');
        console.log(`✅ Pro Plan found: ${proProduct.name}\n`);

        // Test 3: Get prices for each product
        console.log('3. Getting prices...');

        const starterPrices = await stripe.prices.list({
            product: 'prod_T8k2qhwHZnunO8',
            active: true
        });
        console.log(`✅ Starter Plan prices: ${starterPrices.data.length} found`);
        starterPrices.data.forEach(price => {
            console.log(`   - ${price.id}: ${price.unit_amount / 100} ${price.currency} / ${price.recurring?.interval}`);
        });

        const proPrices = await stripe.prices.list({
            product: 'prod_T8k3mCxHQVKP8y',
            active: true
        });
        console.log(`✅ Pro Plan prices: ${proPrices.data.length} found`);
        proPrices.data.forEach(price => {
            console.log(`   - ${price.id}: ${price.unit_amount / 100} ${price.currency} / ${price.recurring?.interval}`);
        });

        console.log('\n🎉 All tests passed! Stripe integration is ready.');

        // Test 4: Create a test checkout session (optional)
        if (process.argv.includes('--test-checkout')) {
            console.log('\n4. Testing checkout session creation...');
            const testSession = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price: starterPrices.data[0].id,
                    quantity: 1,
                }],
                mode: 'subscription',
                success_url: 'http://localhost:5173/test-success',
                cancel_url: 'http://localhost:5173/test-cancel',
                customer_email: 'test@example.com'
            });
            console.log(`✅ Test checkout session created: ${testSession.url}`);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('1. Check your STRIPE_SECRET_KEY in .env');
        console.error('2. Verify the product IDs are correct');
        console.error('3. Make sure your Stripe account is active');
        process.exit(1);
    }
}

// Run the test
testStripeIntegration();
