const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: attData, error } = await supabase
 .from('attendance_records')
 .select('id, session:class_sessions(id, date, status, schedule_id)')
 .limit(1);
  console.log("Error:", error);
  console.log("Data:", JSON.stringify(attData, null, 2));
}
run();
