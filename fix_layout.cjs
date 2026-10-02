const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx', 'utf8');

// Move the closing div of the left column to after grievances
const pattern = /\s*\}\)\}\s*<\/div>\s*\}\)\}\s*<\/div>\s*\{grievances\.length > 0/g;
// Wait, let's just find the exact block and replace it using string split or regex
const parts = code.split('{/* Meeting Requests */}');
let upperPart = parts[0];

// In upperPart, find the end of appeals and the grievances block
// Current structure:
// {appeals.map(...)}
// </div>
// )}
// </div>  <--- closes left column
// {grievances.length > 0 && ... }
// </div>
// )}

upperPart = upperPart.replace('</div>\n\n\n {grievances.length > 0 && (', '\n\n {grievances.length > 0 && (');
// Now we need to add the </div> back at the end of upperPart
upperPart = upperPart.trimEnd() + '\n </div>\n\n ';

code = upperPart + '{/* Meeting Requests */}' + parts[1];

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx', code);
console.log("Fixed grievances layout");
