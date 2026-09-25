import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './Frontend/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getFacilities() {
  const { data, error } = await supabase.from('campus_facilities').select('id, title');
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

getFacilities();
