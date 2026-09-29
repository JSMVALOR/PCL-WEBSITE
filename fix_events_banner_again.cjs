const fs = require('fs');
const file = 'Frontend/ERP/components/notices/EventsBoard.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<\/div>\s*\{canCreate && \(\s*<button type="button"[\s\S]*?<\/button>\s*\)\}\s*<\/div>\s*<\/div>/;

content = content.replace(regex, '</div>');

fs.writeFileSync(file, content);
