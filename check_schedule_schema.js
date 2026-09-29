import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('class_schedule').select('*').limit(1);
  if (error) console.error(error);
  else console.log("class_schedule schema:", data);
  const { data: cols, error: errCols } = await supabase.rpc('get_schema_columns', { table_name: 'class_schedule' });
  if (errCols) console.error("RPC fail", errCols.message);
  else console.log(cols);
}
run();
