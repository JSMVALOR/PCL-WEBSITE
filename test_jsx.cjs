const fs = require('fs');
try {
  const code = fs.readFileSync('Frontend/ERP/components/Student/Attendance/Attendance.jsx', 'utf8');
  require('@babel/core').transformSync(code, {
    presets: ['@babel/preset-react'],
    plugins: ['@babel/plugin-syntax-jsx']
  });
  console.log("Syntax is valid");
} catch(e) {
  console.error("Error:", e.message);
}
