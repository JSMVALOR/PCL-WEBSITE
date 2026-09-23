const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
let url = '', key = '';
env.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

fetch(`${url}/rest/v1/?apikey=${key}`)
  .then(r => r.json())
  .then(data => {
     fs.writeFileSync('openapi.json', JSON.stringify(data, null, 2));
     console.log("Written openapi.json");
  });
