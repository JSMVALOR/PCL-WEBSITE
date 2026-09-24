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
  const insertData = {
    title: "Test",
    description: "Test",
    event_date: "2026-09-09",
    location: "TBA",
    image_url: null,
    is_public: false,
    author_name: "test",
    author_id: 1 // Integer
  };
  const { error } = await supabase.from('admin_events').insert([insertData]).select();
  console.log("Integer error:", error);
  
  const insertData2 = {
    ...insertData,
    author_id: "6e2c3479-78ea-4886-9dc7-66a6a9be69a8" // UUID
  };
  const { error: error2 } = await supabase.from('admin_events').insert([insertData2]).select();
  console.log("UUID error:", error2);
}
check();
