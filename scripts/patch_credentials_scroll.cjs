const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Student/Credentials/Credentials.jsx', 'utf8');

// Fix the main wrapper so it scrolls nicely on mobile instead of being fixed
file = file.replace(
    /<div className="flex flex-col lg:flex-row h-full w-full gap-6 p-2 lg:p-0">/,
    '<div className="flex flex-col lg:flex-row min-h-full lg:h-full w-full gap-6 p-2 lg:p-0 overflow-y-auto lg:overflow-hidden">'
);

fs.writeFileSync('Frontend/ERP/components/Student/Credentials/Credentials.jsx', file);
