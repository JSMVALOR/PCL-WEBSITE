import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase.from('grievances').insert({ reporter_id: '123e4567-e89b-12d3-a456-426614174000', category: 'test', title: 'test', description: 'test', is_anonymous: true });
  console.log(error);
}
test()
