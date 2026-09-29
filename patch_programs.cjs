const fs = require('fs');
const file = 'Frontend/Website/components/NAVBAR/PROGRAMS/Programs.jsx';
let content = fs.readFileSync(file, 'utf8');

// Update Supabase query
content = content.replace(
  /.from\('academic_events'\)\s*\.select\('\*'\)\s*\.eq\('is_active', true\)\s*\.order\('date', { ascending: true }\)/,
  `.from('admin_events')\n          .select('*')\n          .eq('is_public', true)\n          .gte('event_date', new Date().toISOString())\n          .order('event_date', { ascending: true })`
);

// Update map render logic
content = content.replace(/item\.date/g, 'item.event_date');
content = content.replace(/item\.event_type/g, '(item.location || "PCL Campus")');

// Remove the button
content = content.replace(/<button onClick=\{\(\) => alert\("Syllabus PDF is currently being updated for the 2026 academic year\."\)\} className="tlh-btn justify-center" style=\{\{ maxWidth: '300px' \}\}>\s*<span className="text-xs font-bold uppercase tracking-widest">Download PDF Calendar<\/span>\s*<svg width="9" height="13" viewBox="0 0 9 13" fill="none" xmlns="http:\/\/www\.w3\.org\/2000\/svg">\s*<path d="M1\.64453 0\.972656L6\.97897 6\.3071L1\.67567 11\.6104" stroke="currentColor" strokeWidth="2"\/>\s*<\/svg>\s*<\/button>/g, '');

fs.writeFileSync(file, content);
