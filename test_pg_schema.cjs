const { Client } = require('pg');
const fs = require('fs');
const envStr = fs.readFileSync('.env', 'utf8');
const env = {};
envStr.split('\n').forEach(line => {
  if (line && line.includes('=')) {
    const [k, v] = line.split('=');
    env[k.trim()] = v.trim();
  }
});

const client = new Client({ connectionString: env.DATABASE_URL });
client.connect().then(() => {
  return client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'marks_submissions';
  `);
}).then(res => {
  console.log("Columns:", res.rows);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
