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
    const cs = schema.definitions.class_sessions;
    console.log("class_sessions:", cs ? Object.keys(cs.properties) : "not found");
    const as = schema.definitions.assignments;
    console.log("assignments:", as ? Object.keys(as.properties) : "not found");
    const fl = schema.definitions.faculty_leaves;
    console.log("faculty_leaves:", fl ? Object.keys(fl.properties) : "not found");
    const ms = schema.definitions.master_subjects;
    console.log("master_subjects:", ms ? Object.keys(ms.properties) : "not found");
  })
  .catch(console.error);
