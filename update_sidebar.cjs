const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx', 'utf8');

// The file has two arrays: ADMIN_NAV_GROUPS and ADMIN_NAV_MEGA

// 1. Move notices to HR & Finance in ADMIN_NAV_GROUPS (Wait, is it in ADMIN_NAV_GROUPS? Let's check.)
// In ADMIN_NAV_GROUPS:
// "Comms & Events" doesn't exist. There's no 'notices' in ADMIN_NAV_GROUPS according to earlier view_file?
// Wait, I didn't see `notices` in ADMIN_NAV_GROUPS. Let's see:
