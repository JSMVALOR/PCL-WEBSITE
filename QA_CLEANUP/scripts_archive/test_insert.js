import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data: p } = await supabase.from('profiles').select('id').eq('role', 'student').limit(1).single();
  if (p) {
    const { error } = await supabase.from('student_achievements').insert({
      student_id: p.id,
      title: 'test insert'
    });
    console.log('Insert error for student:', error);
  }
}
test()
