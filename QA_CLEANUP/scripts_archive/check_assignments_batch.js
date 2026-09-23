import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase.from('assignments').select('*').order('created_at', { ascending: false }).limit(3);
  console.log('Latest assignments:', data);
  const { data: p, error: pe } = await supabase.from('profiles').select('id, role, academic_batch').eq('role', 'student').limit(3);
  console.log('Sample students:', p);
}
test()
