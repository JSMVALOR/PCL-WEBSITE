const fs = require('fs');
let path = 'backend/whatsapp-engine/Dockerfile';
let content = fs.readFileSync(path, 'utf8');

// Add openssh-client and the git config tweak to be absolutely safe
content = content.replace(
    'git \\',
    'git \\\n    openssh-client \\'
);

// Add the git config to the Dockerfile before npm install
content = content.replace(
    'RUN npm install',
    'RUN git config --global url."https://github.com/".insteadOf ssh://git@github.com/\nRUN npm install'
);

fs.writeFileSync(path, content);
console.log('Fixed Dockerfile to support github SSH resolution');
