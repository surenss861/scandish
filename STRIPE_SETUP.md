# Stripe Integration Setup Guide

## 1. Environment Variables

Add these to your `backend/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=http://localhost:5173
```

## 2. Stripe Dashboard Setup

### Products (Already Created ✅)
- **Starter Plan**: `prod_T8k2qhwHZnunO8` ($9/month)
- **Pro Plan**: `prod_T8k3mCxHQVKP8y` ($29/month)

### Webhook Endpoint
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `http://localhost:4000/api/webhook`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook secret to your `.env` file

## 3. Database Schema

Run this SQL in your Supabase SQL editor:

```sql
-- Add plan columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Update existing users to have 'free' plan
UPDATE public.users 
SET plan = 'free' 
WHERE plan IS NULL;
```

## 4. Test Cards

Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Any future expiry date and any 3-digit CVC

## 5. Testing the Flow

1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `cd frontend && npm run dev`
3. Go to Account & Billing → Upgrade tab
4. Click "Upgrade to Starter Plan" or "Upgrade to Pro Plan"
5. Complete the test payment
6. Check that your plan is updated in the database

## 6. Troubleshooting

### Common Issues:
- **"Failed to create checkout session"**: Check STRIPE_SECRET_KEY
- **Webhook not working**: Verify webhook URL and secret
- **Plan not updating**: Check database schema and webhook events

### Debug Steps:
1. Check backend logs for Stripe errors
2. Verify webhook endpoint is accessible
3. Test with Stripe CLI: `stripe listen --forward-to localhost:4000/api/webhook`
