const fs = require('fs');
const file = 'Frontend/ERP/components/shared/DashboardWidgets/FacultyWebClock.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace insert with upsert in handleClockIn
content = content.replace(/const \{ data, error \} = await supabase\.from\('faculty_daily_presence'\)\.insert\(\[payload\]\)\.select\(\)\.single\(\);/g, 
    `const { data, error } = await supabase.from('faculty_daily_presence').upsert(payload, { onConflict: 'faculty_id,date' }).select().single();`);

// Ensure attendanceRecord fallback has id if it was missing during upsert error
// Actually, if it's upsert, it shouldn't fail due to unique constraint.

fs.writeFileSync(file, content);
