import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data } = await supabase.from('cohort_subjects').select('id, batch_id, academic_batches(id, batch_name), master_subjects(id, name, code)').limit(2);
  console.log(JSON.stringify(data, null, 2));
}
test()
