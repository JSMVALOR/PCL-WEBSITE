const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: allSessions } = await supabase.from('class_sessions').select('id');
  const validIds = new Set(allSessions.map(s => s.id));
  
  const { data: att } = await supabase.from('attendance_records').select('id, session_id');
  const orphans = att.filter(a => !validIds.has(a.session_id));
  
  console.log("Total orphaned attendance records:", orphans.length);
  
  if (orphans.length > 0) {
      // delete them
      for (const o of orphans) {
          await supabase.from('attendance_records').delete().eq('id', o.id);
      }
      console.log("Deleted orphans.");
  }
}
run();
