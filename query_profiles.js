const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: 'Backend/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("No Supabase URL/Key found in environment variables.");
  // try frontend env
  require('dotenv').config({ path: 'Frontend/ERP/.env' });
}

const url2 = process.env.VITE_SUPABASE_URL;
const key2 = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url2, key2);

async function check() {
  const { data: profiles } = await supabase.from('profiles').select('academic_batch').eq('role', 'student');
  const batches = [...new Set(profiles.map(p => p.academic_batch))];
  console.log("Available batches in profiles:", batches);
  
  const { data: assignments } = await supabase.from('assignments').select('batch');
  const assignBatches = [...new Set(assignments.map(a => a.batch))];
  console.log("Available batches in assignments:", assignBatches);
}
check();
