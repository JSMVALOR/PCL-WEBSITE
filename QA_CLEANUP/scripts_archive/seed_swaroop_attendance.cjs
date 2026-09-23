const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: user } = await supabase.from('profiles').select('id, academic_batch').ilike('full_name', '%swaroop%').single();
  if (!user) return console.log("No Swaroop");
  
  const { data: sched } = await supabase.from('class_schedule').select('id, faculty_id').eq('batch', user.academic_batch).limit(3);
  if (!sched || sched.length === 0) return console.log("No schedules");

  for (let i = 0; i < sched.length; i++) {
      const s = sched[i];
      // Create a session
      const { data: session } = await supabase.from('class_sessions').insert({
          schedule_id: s.id,
          faculty_id: s.faculty_id || user.id, // fallback if faculty_id missing
          date: new Date().toISOString().split('T')[0],
          status: 'completed',
          started_at: new Date().toISOString(),
          ended_at: new Date().toISOString()
      }).select().single();
      
      if (session) {
          // Create attendance record
          await supabase.from('attendance_records').insert({
              session_id: session.id,
              student_id: user.id,
              entry_status: i === 0 ? 'late' : (i === 1 ? 'present' : 'absent'),
              exit_status: i === 0 ? 'present' : (i === 1 ? 'present' : 'absent'),
              entry_marked_at: new Date().toISOString(),
              exit_marked_at: new Date().toISOString(),
              marked_by: 'faculty'
          });
      }
  }
  console.log("Successfully seeded Swaroop attendance!");
}
run();
