import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function fix() {
  // Get the batch UUID for LLB (Class of 2029)
  const { data: b } = await supabase.from('academic_batches').select('id').eq('name', 'LLB (Class of 2029)').single();
  if (b) {
    const { error } = await supabase.from('assignments').update({ 
      batch: 'LLB (Class of 2029)', 
      batch_id: b.id 
    }).eq('id', '7201d526-e621-4e05-93e6-2642959b3b2b');
    console.log('Fixed orphan assignment:', error);
  } else {
    console.log('Batch not found');
  }
}
fix()
