const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Notices/FacultyBroadcastForm.jsx';
let content = fs.readFileSync(file, 'utf8');

// Remove state
content = content.replace(/const \[requiresAck, setRequiresAck\] = useState\(false\);\n/, '');

// Remove insert field
content = content.replace(/\s*requires_acknowledgement:\s*requiresAck,/, '');

// Remove setRequiresAck(false)
content = content.replace(/\s*setRequiresAck\(false\);/, '');

// Remove UI label block
const uiBlockRegex = /<label className="flex items-center gap-4 p-5 bg-blue-500\/5 dark:bg-blue-500\/10 border border-blue-500\/20 rounded-2xl cursor-pointer hover:border-blue-500\/40 transition-colors">\s*<input type="checkbox" checked={requiresAck}[\s\S]*?<\/label>/;
content = content.replace(uiBlockRegex, '');

fs.writeFileSync(file, content);
