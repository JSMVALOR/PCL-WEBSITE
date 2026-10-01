const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/LeaveManagement/LeaveCalendar.jsx', 'utf8');

file = file.replace(/grid grid-cols-7 gap-3/g, 'grid grid-cols-7 gap-1 md:gap-3');
file = file.replace(/min-h-\[100px\]/g, 'min-h-[60px] md:min-h-[100px]');
file = file.replace(/min-h-\[80px\]/g, 'min-h-[50px] md:min-h-[80px]');

fs.writeFileSync('Frontend/ERP/components/Admin/LeaveManagement/LeaveCalendar.jsx', file);
