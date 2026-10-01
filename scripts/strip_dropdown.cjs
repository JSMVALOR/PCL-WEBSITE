const fs = require('fs');

const file = 'Frontend/ERP/components/shared/TopNav.jsx';
let content = fs.readFileSync(file, 'utf8');

// Remove the import
content = content.replace(/import NotificationsDropdown from '\.\/Navigation\/NotificationsDropdown';\n/g, '');

// Remove the onMouseEnter and onMouseLeave from the div
content = content.replace(
    /<div\n\s*className="relative h-full flex items-center"\n\s*onMouseEnter=\{\(\) => handleMouseEnter\('notifications'\)\}\n\s*onMouseLeave=\{handleMouseLeave\}\n\s*>/g,
    '<div className="relative h-full flex items-center">'
);

// Remove the AnimatePresence and NotificationsDropdown block
const dropdownRegex = /<AnimatePresence>\s*\{activeDropdown === 'notifications' && \(\s*<NotificationsDropdown[\s\S]*?\/>\s*\)\}\s*<\/AnimatePresence>/g;
content = content.replace(dropdownRegex, '');

fs.writeFileSync(file, content);
