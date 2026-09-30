const fs = require('fs');
let file = 'Frontend/ERP/components/Parent/ParentDashboard/ParentDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 1: userSession.id to userSession?.id
content = content.replace(/parent_dashboard_\$\{userSession\.id\}/g, 'parent_dashboard_${userSession?.id}');

// Fix 2: studentData.full_name to studentData?.full_name
content = content.replace(/parent of \$\{studentData\.full_name\}/g, 'parent of ${studentData?.full_name || "Student"}');
content = content.replace(/Parent of \$\{studentData\.full_name\}/g, 'Parent of ${studentData?.full_name || "Student"}');

// Fix 3: f.amount.toLocaleString to Number(f.amount || 0).toLocaleString
content = content.replace(/\{f\.amount\.toLocaleString/g, '{Number(f.amount || 0).toLocaleString');

// Fix 4: a.title to a.assignments?.title in Assignments render
content = content.replace(/\{a\.title\}/g, '{a.assignments?.title || "Assignment"}');
content = content.replace(/\{new Date\(a\.due_date\)\.toLocaleDateString/g, '{new Date(a.assignments?.due_date || new Date()).toLocaleDateString');
content = content.replace(/\{a\.subject_code\}/g, '{a.assignments?.subject_code || ""}');

fs.writeFileSync(file, content);
