import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('whatsapp_queue').insert({
    phone: 'test',
    message: 'test',
    status: 'PENDING',
    recipient_name: 'test'
  });
  console.log('Error:', error);
}
run();
