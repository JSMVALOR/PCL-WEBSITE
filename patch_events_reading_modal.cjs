const fs = require('fs');
const file = 'Frontend/ERP/components/notices/EventsBoard.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="bg-themeApp w-full max-w-2xl rounded-xl overflow-hidden border border-black\/5 dark:border-white\/10 shadow-2xl flex flex-col max-h-\[90vh\]">/g;

const replacement = '<div className="bg-themeApp w-full h-[100dvh] md:h-auto md:max-h-[90vh] max-w-2xl md:rounded-2xl overflow-hidden border-0 md:border border-black/5 dark:border-white/10 shadow-2xl flex flex-col">';

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
