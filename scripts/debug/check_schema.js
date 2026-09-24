import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
  const { data: image_url_data, error: image_url_err } = await supabase.from('grievances').select('image_url').limit(1);
  const { data: updated_at_data, error: updated_at_err } = await supabase.from('grievances').select('updated_at').limit(1);
  const { data: reporter_id_data, error: reporter_id_err } = await supabase.from('grievances').select('reporter_id').limit(1);
  
  console.log("image_url:", image_url_err ? image_url_err.message : "Exists");
  console.log("updated_at:", updated_at_err ? updated_at_err.message : "Exists");
  console.log("reporter_id:", reporter_id_err ? reporter_id_err.message : "Exists");
}
check();
