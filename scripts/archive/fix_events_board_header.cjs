const fs = require('fs');
const file = 'Frontend/ERP/components/notices/EventsBoard.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /<div className="relative flex flex-col md:flex-row justify-between items-center gap-6 py-6 border-b border-black\/\[0\.04\] dark:border-white\/\[0\.04\] shrink-0">[\s\S]*?\{canCreate && events\.some/m;

// Wait, the regex might be tricky. Let me just split the file.
