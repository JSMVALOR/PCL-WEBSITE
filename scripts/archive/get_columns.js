import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data } = await supabase.from('class_schedule').select('*').limit(1);
    if (data && data.length > 0) {
        console.log(Object.keys(data[0]));
    } else {
        // Just force an error to see what column it doesn't have, or insert dummy
        const { error } = await supabase.from('class_schedule').insert({ invalid_column: 1 });
        console.log(error.message);
    }
}
run();
