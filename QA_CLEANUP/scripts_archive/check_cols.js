import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('notifications').select('*').limit(1);
  if (data && data.length > 0) {
      console.log(Object.keys(data[0]));
  } else {
      console.log("No rows, trying to insert an empty row to see error");
      const { error: e2 } = await supabase.from('notifications').insert([{ non_existent_column: 1 }]);
      console.log(e2);
  }
}
check();
