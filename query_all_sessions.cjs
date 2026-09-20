const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: allSessions } = await supabase.from('class_sessions').select('*');
  console.log("Total class_sessions:", allSessions?.length);
  if (allSessions && allSessions.length > 0) {
      console.log("Sample session:", allSessions[0]);
  }
}
run();
