const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const out = execSync("grep -rhE \"supabase\\.from\\(['\\\`\\\"][a-zA-Z0-9_]+['\\\`\\\"]\\)\" Frontend/ERP/ | sed -E \"s/.*supabase\\.from\\(['\\\`\\\"]([a-zA-Z0-9_]+)['\\\`\\\"]\\).*/\\1/\" | sort | uniq", { encoding: 'utf8' });
const tables = out.split('\n').map(t => t.trim()).filter(t => t);

console.log("Found " + tables.length + " unique tables. Testing linkage...");

async function checkTable(table) {
    return new Promise((resolve) => {
        const url = new URL(SUPABASE_URL + "/rest/v1/" + table + "?limit=1");
        const req = https.request(url, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ table, status: 'OK' });
                } else if (res.statusCode === 404) {
                    resolve({ table, status: 'MISSING (404)' });
                } else {
                    resolve({ table, status: 'EXISTS_BUT_RESTRICTED (' + res.statusCode + ')' });
                }
            });
        });
        req.on('error', (e) => resolve({ table, status: 'NETWORK_ERROR: ' + e.message }));
        req.end();
    });
}

async function run() {
    let missing = [];
    for (let table of tables) {
        process.stdout.write("Testing " + table + "... ");
        const result = await checkTable(table);
        console.log(result.status);
        if (result.status.includes('MISSING')) {
            missing.push(table);
        }
    }
    if (missing.length > 0) {
        console.log("\n\nFAILED SYNC TEST: The following tables are missing in Supabase:");
        missing.forEach(t => console.log(" - " + t));
        process.exit(1);
    } else {
        console.log("\n\nSYNC TEST PASSED! All tables referenced in the frontend exist in the backend database.");
    }
}
run();
