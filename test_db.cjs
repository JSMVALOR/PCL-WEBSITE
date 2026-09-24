require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('class_sessions').select('*').limit(1);
  console.log("class_sessions:", data);
  if (error) console.error("Error:", error);
}
check();
