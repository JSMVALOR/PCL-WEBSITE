const fs = require('fs');
const { execSync } = require('child_process');

function scan() {
  const report = {};
  
  // 1. Lazy Loading check
  try {
    const lazyLoaded = execSync('grep -r "React.lazy" Frontend/ERP').toString();
    report.lazyLoading = "Found React.lazy usage";
  } catch (e) {
    report.lazyLoading = "No React.lazy found - potentially huge bundle size";
  }

  // 2. ErpContext size
  try {
    const contextLines = execSync('wc -l Frontend/ERP/context/ErpContext.jsx').toString();
    report.contextSize = contextLines.trim();
  } catch (e) {}

  // 3. Security: Check for env variables hardcoded
  try {
    const envVars = execSync('grep -r "VITE_" Frontend/ERP | grep -v "\.env"').toString().split('\n').slice(0, 5);
    report.envExposure = envVars;
  } catch (e) {}
  
  // 4. Console.logs
  try {
    const logs = execSync('grep -r "console.log" Frontend/ERP/components | wc -l').toString();
    report.consoleLogs = logs.trim();
  } catch(e) {}
  
  // 5. Error handling without Toast
  try {
    const rawErrors = execSync('grep -r "console.error" Frontend/ERP/components | wc -l').toString();
    report.rawErrors = rawErrors.trim();
  } catch(e) {}

  console.log(JSON.stringify(report, null, 2));
}

scan();
