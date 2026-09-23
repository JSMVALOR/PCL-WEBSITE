const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf-8');
let url = '';
let key = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function test() {
    const { data, error } = await supabase.from('notices').insert([{
        title: "Test",
        content: "Test Content",
        category: "Academic",
        priority: "normal",
        target_audience: ["ALL"],
        
        author_id: "test-id"
    }]);
    console.log("Error:", error);
}
test();
