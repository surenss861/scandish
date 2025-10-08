// Quick script to set ssurn29@gmail.com to Pro plan
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setUserToPro() {
    try {
        console.log('Setting ssurn29@gmail.com to Pro plan...');

        // First, find the user by email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', 'ssurn29@gmail.com')
            .single();

        if (userError || !user) {
            console.error('User not found:', userError);
            return;
        }

        console.log('Found user:', user);

        // Set the user to Pro plan
        const { data, error } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: user.id,
                plan: 'pro',
                status: 'active',
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Failed to set Pro plan:', error);
            return;
        }

        console.log('✅ Successfully set ssurn29@gmail.com to Pro plan!');
        console.log('User ID:', user.id);
        console.log('Email:', user.email);
        console.log('Plan: pro');
        console.log('Status: active');

    } catch (error) {
        console.error('Error:', error);
    }
}

setUserToPro();





