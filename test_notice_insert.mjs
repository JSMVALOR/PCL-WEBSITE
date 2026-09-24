import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    env[key] = rest.join('=');
  }
});
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { error } = await supabase.from('notices').insert([{
        title: 'test',
        content: 'test',
        category: 'test',
        priority: 'test',
        target_audience: ['All'],
        requires_acknowledgement: false,
        author_id: 'test',
        external_link: 'http://test.com'
  }]);
  console.log("Insert error:", error);
}
check();
