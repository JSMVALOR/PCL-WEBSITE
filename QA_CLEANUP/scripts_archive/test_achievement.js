import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase.from('student_achievements').select('*').limit(1);
  console.log('Select error:', error);
  
  const { data: d2, error: e2 } = await supabase.from('student_achievements').insert({
    student_id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'test'
  });
  console.log('Insert error:', e2);
}
test()
