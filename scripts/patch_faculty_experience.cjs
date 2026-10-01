const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/ABOUT/FacultyProfile.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add experience to ALL_TABS
const tabsRegex = /const ALL_TABS = \[\s*\{ id: 'education', label: 'Education' \},/;
content = content.replace(tabsRegex, "const ALL_TABS = [\n  { id: 'experience', label: 'Past Experience' },\n  { id: 'education', label: 'Education' },");

// Add experience to the fetch query
content = content.replace(
  'linkedin_url, scholar_url, education, research, projects, patents, awards, is_public, image_url',
  'linkedin_url, scholar_url, experience, education, research, projects, patents, awards, is_public, image_url'
);

fs.writeFileSync(file, content);
