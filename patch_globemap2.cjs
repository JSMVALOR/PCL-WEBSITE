const fs = require('fs');
let file = 'Frontend/Website/components/UI/GlobeMap.jsx';
let content = fs.readFileSync(file, 'utf8');

// Remove dark tiles completely
content = content.replace(/className="dark-tiles"/g, '');

fs.writeFileSync(file, content);
