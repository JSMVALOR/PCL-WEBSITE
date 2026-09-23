import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
async function test() {
  const { data, error } = await supabase.from('assignments').select('*').eq('batch_id', 'LLB (Class of 2029)')
  console.log('Error:', error)
}
test()
