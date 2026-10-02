require('dotenv').config();
const { Client } = require('pg');

const connUrl = process.env.DATABASE_URL.replace('5432', '6543');
const client = new Client({
  connectionString: connUrl
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'attendance_audit_logs'
  `);
  console.log(res.rows.map(r => r.column_name));
  await client.end();
}
run();
