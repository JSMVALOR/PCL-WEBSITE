import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Connecting via Supabase REST API...");
  
  // Try inserting notice
  const { data, error } = await supabase.from('admin_notices').insert([{
    title: 'Load Test Notice API',
    content: 'Automated test from REST API',
    category: 'Notice',
    is_public: true
  }]).select();

  if (error) {
    console.error("Insert failed (RLS probably):", error.message);
  } else {
    console.log("Successfully inserted notice via REST API!");
  }
}
run();
