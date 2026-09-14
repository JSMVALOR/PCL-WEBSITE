/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with the same project config as the ERP
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
