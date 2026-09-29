const fs = require('fs');
const file = 'Frontend/ERP/components/notices/EventsBoard.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="bg-white\/70 dark:bg-white\/\[0\.03\] backdrop-blur-3xl saturate-\[1\.8\] border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] rounded-2xl p-6 lg:p-8 flex flex-col gap-6 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] dark:shadow-\[0_8px_30px_rgb\(0,0,0,0\.2\)\]">/g;

content = content.replace(regex, '<div className="flex flex-col gap-6">');
fs.writeFileSync(file, content);
