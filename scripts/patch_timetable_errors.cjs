const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx', 'utf8');

// Replace generic error toasts with actual error messages
file = file.replace(/window\.erpToast\.show\("An error occurred\. Please try again\.", "error"\);/g, 'window.erpToast.show(err.message || "An error occurred", "error");');

fs.writeFileSync('Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx', file);
