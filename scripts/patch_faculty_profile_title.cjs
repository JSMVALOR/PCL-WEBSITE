const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/ABOUT/FacultyProfile.jsx';
let content = fs.readFileSync(file, 'utf8');

// Strip "Prudentia College of Law" from designation in the UI
content = content.replace(
  '<h2 className="text-xs md:text-sm font-semibold text-[var(--primary-color)] uppercase tracking-[0.2em]">\n                {faculty.designation}\n                </h2>',
  '<h2 className="text-xs md:text-sm font-semibold text-[var(--primary-color)] uppercase tracking-[0.2em]">\n                {faculty.designation?.replace(/,\\s*prudentia college of law/i, "")?.replace(/prudentia college of law/i, "")}\n                </h2>'
);

fs.writeFileSync(file, content);
