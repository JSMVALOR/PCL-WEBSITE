import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data: asgs, error } = await supabase.from('assignments').select('id, batch, batch_id').order('created_at', { ascending: false }).limit(3);
  console.log('Assignments in DB:', asgs);

  const { data: p } = await supabase.from('profiles').select('id, full_name, role, academic_batch').eq('role', 'student').limit(3);
  console.log('Sample Students:', p);
}
test()
