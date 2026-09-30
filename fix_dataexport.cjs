const fs = require('fs');
let file = 'Frontend/Shared/utils/DataExport.js';
let content = fs.readFileSync(file, 'utf8');

// Replace { data: profile } with { data: profile, error: err1 }
// Actually, easier: just replace destructuring if we want to check errors, but since this is just an export, if an error happens, data will be null.
// The auditor said it silently generates partial exports. If they want it to abort on error:
// Let's just do a simple replace that throws on error.
content = content.replace(/const \{ data: (.*?) \} = await supabase(.*?);/g, `const { data: $1, error: err_$1 } = await supabase$2;
        if (err_$1 && err_$1.code !== 'PGRST116') throw err_$1; // Ignore 0 rows returned error`);

fs.writeFileSync(file, content);
