import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase.rpc('get_table_triggers', { table_name: 'assignments' });
  console.log('Triggers RPC:', data, error);
}

test()
