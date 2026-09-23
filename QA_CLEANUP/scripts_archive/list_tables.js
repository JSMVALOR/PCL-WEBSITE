import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase.from('assignments').select('id').limit(1);
  console.log('Assignments query:', error);
}

test()
