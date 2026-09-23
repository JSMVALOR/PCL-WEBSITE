require('dotenv').config();
console.log(process.env.DATABASE_URL ? "Database URL found: " + process.env.DATABASE_URL.substring(0, 30) + "..." : "Database URL not found");
