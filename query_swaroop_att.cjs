const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: user } = await supabase.from('profiles').select('id, full_name').ilike('full_name', '%swaroop%').single();
  console.log("User:", user);
  if (!user) return;

  const { data: att, error } = await supabase
 .from('attendance_records')
 .select('id, entry_status, exit_status, entry_marked_at, status, session_id')
 .eq('student_id', user.id);
  
  console.log("Attendance Error:", error);
  console.log("Attendance Data:", att);
  
  if (att && att.length > 0) {
      const { data: session } = await supabase.from('class_sessions').select('id, schedule_id').eq('id', att[0].session_id);
      console.log("Session Mapping:", session);
  }
}
run();
