const fs = require('fs');

let file = 'Frontend/ERP/ErpApp.jsx';
let content = fs.readFileSync(file, 'utf8');

// Import
content = content.replace(
    "import AdminMarksController from './components/Admin/AdminMarksController/AdminMarksController';",
    "import AdminMarksController from './components/Admin/AdminMarksController/AdminMarksController';\nimport AdminCampusTimings from './components/Admin/AdminAcademicHub/AdminCampusTimings';"
);

// Switch case
content = content.replace(
    "case 'markscontroller': return <AdminMarksController />;",
    "case 'markscontroller': return <AdminMarksController />;\n        case 'campustimings': return <AdminCampusTimings />;"
);

fs.writeFileSync(file, content);
