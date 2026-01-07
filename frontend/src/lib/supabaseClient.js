// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_ENV_OK = Boolean(url && anon);

// Only create client if env vars are present
let supabase = null;

if (!SUPABASE_ENV_OK) {
  console.error(
    "❌ Supabase environment variables are missing!\n" +
    "Please create a .env file in the frontend directory with:\n" +
    "VITE_SUPABASE_URL=your_supabase_url\n" +
    "VITE_SUPABASE_ANON_KEY=your_anon_key\n\n" +
    "See ENVIRONMENT_SETUP.md for details."
  );
  
  // Create a mock client that fails gracefully
  // This prevents the app from crashing but will show errors on API calls
  supabase = {
    auth: {
      getSession: async () => {
        console.warn("Supabase not configured - returning empty session");
        return { data: { session: null }, error: null };
      },
      onAuthStateChange: () => {
        console.warn("Supabase not configured - auth state changes disabled");
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: async () => {
        throw new Error("Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file");
      },
      signOut: async () => {
        return { error: null };
      },
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: "Supabase not configured" } }),
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  };
} else {
  supabase = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export { supabase };
