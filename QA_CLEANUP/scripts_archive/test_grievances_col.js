import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data } = await supabase.rpc('get_system_vitals');
  // Just use a dummy query to see columns or insert
  const { error } = await supabase.from('grievances').insert({});
  console.log(error);
}
test()
