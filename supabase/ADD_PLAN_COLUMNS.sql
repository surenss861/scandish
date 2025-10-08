-- Add plan tracking columns to users table
-- This enables soft walls based on user subscription plans

-- Add plan column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Update existing users to have 'free' plan
UPDATE public.users 
SET plan = 'free' 
WHERE plan IS NULL;

-- Add constraints for valid plan values
ALTER TABLE public.users 
ADD CONSTRAINT check_valid_plan 
CHECK (plan IN ('free', 'starter', 'pro'));

-- Add index for plan queries
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);

-- Add index for stripe customer ID queries
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);

-- Add comments for documentation
COMMENT ON COLUMN public.users.plan IS 'User subscription plan: free, starter, or pro';
COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe customer ID for billing management';

-- Create function to update plan from Stripe webhook
CREATE OR REPLACE FUNCTION update_user_plan_from_stripe(
    customer_id text,
    new_plan text
) RETURNS void AS $$
BEGIN
    UPDATE public.users 
    SET plan = new_plan, updated_at = now()
    WHERE stripe_customer_id = customer_id;
    
    -- Log the plan update
    INSERT INTO public.user_plan_history (user_id, old_plan, new_plan, updated_at)
    SELECT id, (SELECT plan FROM public.users WHERE stripe_customer_id = customer_id), new_plan, now()
    FROM public.users 
    WHERE stripe_customer_id = customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create plan history table for tracking changes
CREATE TABLE IF NOT EXISTS public.user_plan_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    old_plan text,
    new_plan text,
    updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for plan history
ALTER TABLE public.user_plan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan history" ON public.user_plan_history
    FOR SELECT USING (auth.uid() = user_id);

-- Add trigger to automatically update plan history
CREATE OR REPLACE FUNCTION log_plan_change() RETURNS trigger AS $$
BEGIN
    IF OLD.plan IS DISTINCT FROM NEW.plan THEN
        INSERT INTO public.user_plan_history (user_id, old_plan, new_plan, updated_at)
        VALUES (NEW.id, OLD.plan, NEW.plan, now());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for plan changes
DROP TRIGGER IF EXISTS plan_change_trigger ON public.users;
CREATE TRIGGER plan_change_trigger
    AFTER UPDATE OF plan ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION log_plan_change();
