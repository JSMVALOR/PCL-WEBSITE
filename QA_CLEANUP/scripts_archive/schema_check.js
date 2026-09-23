import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase.from('assignments').select('*').limit(1);
  console.log('assignments:', error);
  const { data: d2, error: e2 } = await supabase.from('academic_assignments').select('*').limit(1);
  console.log('academic_assignments:', e2);
}
test()
