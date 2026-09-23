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
    requires_acknowledgement: false,
    author_id: 1,
    author_name: 'Test Author'
  }]);
  console.log('author_id integer error:', error);
}

test()
