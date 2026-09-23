import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase.from('mentorship_messages').select('*').limit(1);
  console.log('mentorship_messages:', error);
  const { data: d2, error: e2 } = await supabase.from('messages').select('*').limit(1);
  console.log('messages:', e2);
}
test()
