const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Admin/AdminMarksController/AdminMarksController.jsx', 'utf8');

// Replace roll_number with just erp_id
code = code.replace(/roll_number, /g, '');
code = code.replace(/roll_number/g, 'erp_id'); // If there are any other roll_number references

fs.writeFileSync('Frontend/ERP/components/Admin/AdminMarksController/AdminMarksController.jsx', code);
console.log("Fixed AdminMarksController");
