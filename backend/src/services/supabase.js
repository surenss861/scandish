/*
 * Supabase helper module.
 *
 * This module exports a configured Supabase client using the service role
 * key.  The service role should never be exposed to the client; it grants
 * unrestricted access to your database.  Only use it on trusted backend
 * servers.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    '[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.  Did you forget to set them in your .env file?'
  );
}

// Create a Supabase client with service role.  We disable session persistence
// because the backend does not need to maintain auth tokens like the client.
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

module.exports = { supabase };