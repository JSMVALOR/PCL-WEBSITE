import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data: assigns, error: assErr } = await supabase
    .from('assignments')
    .select('*, subject:subject_id(name, code)')
    .limit(1);
    
  console.log('Query with subject:subject_id ->', assErr);

  const { data: d2, error: e2 } = await supabase
    .from('assignments')
    .select('*, master_subjects(name, code)')
    .limit(1);
    
  console.log('Query with master_subjects ->', e2);
}

test()
