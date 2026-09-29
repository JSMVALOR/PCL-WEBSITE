import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await client.connect();
  const res = await client.query(`SELECT trigger_name, action_statement FROM information_schema.triggers WHERE event_object_table = 'users' OR event_object_table = 'profiles';`);
  console.log(res.rows);
  await client.end();
}
run();
