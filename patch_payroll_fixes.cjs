const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/AdminPayroll/AdminPayroll.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the openPaymentModal typo
content = content.replace(/onClick=\{\(\) => openPaymentModal\(f\)\}/g, "onClick={() => handleOpenPayment(f)}");

// 2. We also need to fix the Grid View toggle that I might have messed up.
// Wait, my previous patch completely replaced the old grid view with my new grid and list view.
// Let's check if the old grid view is still there at the bottom of the file!
