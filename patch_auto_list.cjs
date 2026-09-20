const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /setActiveTab\("window"\);/g,
    `setActiveTab("window");
            if (missedSlot.isMarked) setIsSwipeMode(false);`
);

fs.writeFileSync(path, content);
console.log("Patched auto list mode.");
