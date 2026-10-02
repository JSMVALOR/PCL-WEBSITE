const { Client } = require('pg');
require('dotenv').config({path: '../.env'});

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL + "?sslmode=no-verify" });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT * FROM information_schema.tables 
      WHERE table_name = 'gallery_images';
    `);
    console.log(res.rows);
  } catch(e) {
    console.log("DB ERROR", e);
  } finally {
    await client.end();
  }
}
run();
