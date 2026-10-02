const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
(async () => {
    const { data, error } = await supabase.rpc('get_schema_info_for_table', { table_name: 'admin_notices' });
    if(error) {
        // Fallback to checking columns using a dummy query
        const { data: cols } = await supabase.from('admin_notices').select('*').limit(1);
        if (cols && cols.length > 0) console.log(Object.keys(cols[0]));
        else console.log("Table is empty, can't easily introspect columns without psql.");
    }
})();
