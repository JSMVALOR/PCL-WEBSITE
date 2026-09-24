const fs = require('fs');
const code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('const handleSave = async ()'));
const end = lines.findIndex((l, i) => i > start && l.includes('const handleLockMarks'));
console.log(lines.slice(start, end).join('\n'));
