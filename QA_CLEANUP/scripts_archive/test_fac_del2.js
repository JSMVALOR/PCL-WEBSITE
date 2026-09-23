import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data: p } = await supabase.from('faculty_leaves').select('id').limit(1).single();
  if (p) {
    const { error } = await supabase.from('faculty_leaves').delete().eq('id', p.id);
    console.log('Delete error:', error);
  } else {
    console.log('No leaves found');
  }
}
test()
