import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase.from('assignments').insert({
    faculty_id: '123e4567-e89b-12d3-a456-426614174000',
    subject_id: '123e4567-e89b-12d3-a456-426614174000',
    batch: 'Test Batch',
    title: 'Test',
    description: 'Test',
    total_marks: 100,
    due_date: '2026-10-10',
    status: 'active'
  });
  console.log('insert error:', error);
}

test()
