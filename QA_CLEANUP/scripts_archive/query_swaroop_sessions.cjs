const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: user } = await supabase.from('profiles').select('id, full_name, academic_batch').ilike('full_name', '%swaroop%').single();
  console.log("User:", user);
  if (!user) return;
  
  const { data: sched } = await supabase.from('class_schedule').select('id').eq('batch', user.academic_batch);
  console.log("Found schedules:", sched?.length);

  const { data: sessions } = await supabase.from('class_sessions').select('id, status, schedule_id').in('schedule_id', sched.map(s => s.id));
  console.log("Found sessions:", sessions?.length);
  
  const { data: att } = await supabase.from('attendance_records').select('id, session_id').eq('student_id', user.id);
  console.log("Swaroop records count:", att?.length);
  
  if (att && sessions) {
      const validIds = new Set(sessions.map(s => s.id));
      const orphans = att.filter(a => !validIds.has(a.session_id));
      console.log("Orphaned records:", orphans.length);
  }
}
run();
