const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');

const envConfig = dotenv.parse(fs.readFileSync('.env'));
const client = new Client({
  connectionString: envConfig.DATABASE_URL
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT p.full_name, p.email, p.role, p.department, fp.designation, fp.specialisation, fp.bio, fp.degrees, fp.office_address, fp.image_url
    FROM profiles p
    LEFT JOIN faculty_profiles fp ON p.id = fp.id
    WHERE p.role IN ('faculty', 'admin')
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run().catch(console.error);
