const fs = require('fs');

function fixFile(p) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/schedule:schedule_id\(subject_id\)/g, 'class_schedule(subject_id)');
    
    // Also, we need to update the data access since the object key will be 'class_schedule' instead of 'schedule'
    c = c.replace(/s\.schedule\?\.subject_id/g, 's.class_schedule?.subject_id');
    fs.writeFileSync(p, c);
}

fixFile('src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx');
fixFile('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx');
console.log("Fixed PostgREST select syntax for class_sessions.");
