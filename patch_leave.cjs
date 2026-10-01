const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/LeaveManagement/LeaveDashboard.jsx', 'utf8');

// Change grid columns for Stats Grid to put them side-by-side on mobile
file = file.replace(/<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">/, '<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">');

// Also update the StatCard styling to look better when compact
// Let's modify the StatCard component layout if needed.
// Wait, StatCard is probably in this file. Let's check how it's styled.
