const fs = require('fs');
let file = 'Backend/whatsapp-engine/server.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /puppeteer: \{\n\s*headless: true,\n\s*args: \['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--disable-gpu'\]\n\s*\}/,
    `puppeteer: {
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--disable-gpu']
    }`
);

fs.writeFileSync(file, content);
