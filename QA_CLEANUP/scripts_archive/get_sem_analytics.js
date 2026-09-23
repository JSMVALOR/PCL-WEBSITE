import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase.from('student_semester_analytics').select('*').limit(1);
  console.log(JSON.stringify({data, error}, null, 2));
}
test()
