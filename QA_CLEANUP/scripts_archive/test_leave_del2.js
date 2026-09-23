import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { error } = await supabase.from('leave_requests').delete().eq('id', '123e4567-e89b-12d3-a456-426614174000');
  console.log('Delete error for anon:', error);
}
test()
