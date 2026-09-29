const fs = require('fs');
const file = 'Frontend/ERP/components/shared/TargetAudienceSelector.jsx';
let content = fs.readFileSync(file, 'utf8');

// Clear on mode switch
content = content.replace(
    'onClick={() => setMode(m)}',
    'onClick={() => { setMode(m); onChange(m === "Global" ? ["All"] : []); }}'
);

// Trim roles to just Student and Faculty
content = content.replace(
    "{['Student', 'Faculty', 'Staff', 'Alumni'].map(r => (",
    "{['Student', 'Faculty'].map(r => ("
);

// Individual tags: hide 'Student', 'Faculty' from filtering since they are no longer in the list (if we trim, we don't need to change this logic much, but let's make sure 'Staff', 'Alumni' aren't accidentally filtered out or just remove them from the array filter)
content = content.replace(
    /!\['Student','Faculty','Staff','Alumni'\]\.includes\(v\)/g,
    "!['Student','Faculty'].includes(v)"
);

fs.writeFileSync(file, content);
