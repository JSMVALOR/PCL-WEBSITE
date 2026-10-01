const fs = require('fs');
const file = 'Frontend/ERP/ErpApp.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/if \(userSession\?\.role === 'admin'\) return \{ text: 'text-indigo-500', bg: 'bg-indigo-500', border: 'border-indigo-500' \};/g, "if (userSession?.role === 'admin') return { text: 'text-themeAccent', bg: 'bg-themeAccent', border: 'border-themeAccent' };");
content = content.replace(/if \(userSession\?\.role === 'faculty'\) return \{ text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500' \};/g, "if (userSession?.role === 'faculty') return { text: 'text-themeAccent', bg: 'bg-themeAccent', border: 'border-themeAccent' };");
content = content.replace(/return \{ text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500' \};/g, "return { text: 'text-themeAccent', bg: 'bg-themeAccent', border: 'border-themeAccent' };");

fs.writeFileSync(file, content);
