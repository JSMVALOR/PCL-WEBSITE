import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase.from('academic_batches').select('*').limit(3);
  console.log('academic_batches:', data);
  const { data: b2, error: e2 } = await supabase.from('profiles').select('academic_batch, academic_program').limit(3);
  console.log('profiles:', b2);
}

test()
