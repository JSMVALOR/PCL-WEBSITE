const fs = require('fs');
let file = 'Frontend/ERP/components/Login/Login.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace hardcoded website root variables with ERP theme variables
content = content.replace(/var\(--bg-color\)/g, 'var(--bg-app)');
content = content.replace(/var\(--card-border\)/g, 'var(--border-color)');
content = content.replace(/var\(--primary-color\)/g, 'var(--accent)');
content = content.replace(/var\(--text-color\)/g, 'var(--text-primary)');
content = content.replace(/var\(--text-muted\)/g, 'var(--text-secondary)');
content = content.replace(/var\(--primary-glow\)/g, 'var(--accent)');

fs.writeFileSync(file, content);

let file2 = 'Frontend/ERP/components/Login/OTPVerification.jsx';
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace(/var\(--bg-color\)/g, 'var(--bg-app)');
content2 = content2.replace(/var\(--card-border\)/g, 'var(--border-color)');
content2 = content2.replace(/var\(--primary-color\)/g, 'var(--accent)');
content2 = content2.replace(/var\(--text-color\)/g, 'var(--text-primary)');
content2 = content2.replace(/var\(--text-muted\)/g, 'var(--text-secondary)');
content2 = content2.replace(/var\(--primary-glow\)/g, 'var(--accent)');
fs.writeFileSync(file2, content2);
