const fs = require('fs');
let file = fs.readFileSync('package.json', 'utf8');

file = file.replace(
    /"vite --port 10001": "\^8\.3\.0",/,
    '"vite": "^8.3.0",'
);

fs.writeFileSync('package.json', file);
