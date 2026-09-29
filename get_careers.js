import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vftzuxuofmewxryqfubg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmdHp1eHVvZm1ld3hyeXFmdWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQzMzc1NDAsImV4cCI6MjAyMDUxMzU0MH0.-o...'; 

// Need to read env vars securely or just give the SQL script
