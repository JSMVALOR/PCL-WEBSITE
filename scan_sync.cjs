const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function scanDir(dir) {
  let results = { tables: new Set(), rpcs: new Set() };
  
  try {
    const files = execSync(`find ${dir} -type f -name "*.jsx" -o -name "*.js"`).toString().split('\n').filter(Boolean);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Match supabase.from('table_name')
      const tableMatches = content.matchAll(/supabase\.from\(['"]([^'"]+)['"]\)/g);
      for (const match of tableMatches) {
        results.tables.add(match[1]);
      }
      
      // Match supabase.rpc('function_name'
      const rpcMatches = content.matchAll(/supabase\.rpc\(['"]([^'"]+)['"]/g);
      for (const match of rpcMatches) {
        results.rpcs.add(match[1]);
      }
    });
  } catch (e) {
    console.error(e);
  }
  return results;
}

const adminSync = scanDir('Frontend/ERP/components/Admin');
const facSync = scanDir('Frontend/ERP/components/Faculty');

console.log("=== ADMIN TABLES ===");
console.log(Array.from(adminSync.tables).sort().join('\n'));
console.log("\n=== ADMIN RPCS ===");
console.log(Array.from(adminSync.rpcs).sort().join('\n'));

console.log("\n=== FACULTY TABLES ===");
console.log(Array.from(facSync.tables).sort().join('\n'));
console.log("\n=== FACULTY RPCS ===");
console.log(Array.from(facSync.rpcs).sort().join('\n'));
