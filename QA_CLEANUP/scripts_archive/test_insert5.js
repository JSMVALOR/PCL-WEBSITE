import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function test() {
  const noticeId = `CIR-TEST-1234`;
  const { error } = await supabase.from('notices').insert([{
    notice_id: noticeId,
    title: 'Test',
    content: 'Test content',
    category: 'General',
    priority: 'normal',
    target_audience: 'Student',
    fake_column: true,
    author_id: '123e4567-e89b-12d3-a456-426614174000'
  }]);
  console.log('Fake column error:', error);
}

test()
