const { Client } = require('pg');
const fs = require('fs');

async function main() {
    const client = new Client({
        connectionString: 'postgresql://postgres:Sw%40ropp%401234@db.ltcsfdoawpmbdalisagj.supabase.co:5432/postgres',
    });

    try {
        await client.connect();
        const sql = fs.readFileSync('/Users/JSM/Developer/VALOR./WEBSITE REBUILDS/PRUDENTIA COLLEGE OF LAW WEBSITE & ERP/Backend/all_pending_fixes.sql', 'utf8');
        await client.query(sql);
        console.log('SQL executed successfully');
    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}
main();
