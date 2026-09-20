const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
let url = '', key = '';
env.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

fetch(`${url}/rest/v1/?apikey=${key}`)
  .then(r => r.json())
  .then(schema => {
    console.log(Object.keys(schema.components ? schema.components.schemas : schema.definitions || {}));
    const cs = (schema.components?.schemas || schema.definitions)?.class_sessions;
    console.log("class_sessions:", cs ? Object.keys(cs.properties) : "not found");
  })
  .catch(console.error);
