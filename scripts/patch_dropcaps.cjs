const fs = require('fs');
const file = 'Frontend/Website/components/NAVBAR/ABOUT/LeadershipProfile/LeadershipProfile.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the crazy first-letter styling with just text-justify
content = content.replace(
  /first-letter:text-6xl first-letter:font-bold first-letter:text-\[var\(--primary-color\)\] first-letter:mr-3 first-letter:float-left first-letter:font-serif first-letter:drop-shadow-md first-letter:leading-\[0\.8\] first-letter:mt-2/g,
  ''
);

fs.writeFileSync(file, content);
