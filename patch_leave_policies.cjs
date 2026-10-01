const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/LeaveManagement/LeavePolicies.jsx', 'utf8');

file = file.replace(/grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6/g, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6');
file = file.replace(/rounded-2xl p-6/g, 'rounded-2xl p-4 lg:p-6');
file = file.replace(/mb-6/g, 'mb-4 lg:mb-6');
file = file.replace(/mb-8/g, 'mb-4 lg:mb-8');
file = file.replace(/h-10/g, 'h-auto lg:h-10');

fs.writeFileSync('Frontend/ERP/components/Admin/LeaveManagement/LeavePolicies.jsx', file);
