import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data: p } = await supabase.from('profiles').select('id').eq('role', 'faculty').limit(1).single();
  if (p) {
    const { error } = await supabase.from('faculty_leaves').delete().eq('id', 'dummy');
    console.log('Delete error:', error);
  }
}
test()
