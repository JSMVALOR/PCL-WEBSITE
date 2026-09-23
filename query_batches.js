import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://db.ltcsfdoawpmbdalisagj.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'dummy';
// wait, I don't have the anon key.
