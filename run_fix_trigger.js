import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await client.connect();
  const fs = require('fs');
  const sql = fs.readFileSync('fix_trigger.sql', 'utf8');
  await client.query(sql);
  console.log("Trigger function updated.");
  await client.end();
}
run();
