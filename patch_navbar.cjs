const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/Navbar.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'className="fixed inset-0 bg-[#111111]/80 backdrop-blur-md z-[45]"',
  'className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[45]"'
);

// The dropdown menu itself might have a black background?
// `<div className="w-full max-w-[1400px] mx-auto px-6 py-10 flex justify-between gap-16">`
// Wait, the dropdown background is:
// `className="absolute top-[100%] left-0 w-full bg-[var(--bg-color)] border-y border-[var(--card-border)] shadow-2xl animate-fade-in z-50"`
// This is already Beige!

fs.writeFileSync(file, content);
