const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /const \{ error: deleteError \} = const \{error: err\} = await supabase/g,
    'const { error: deleteError } = await supabase'
);

fs.writeFileSync(file, content);
