const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetIdQuery = ` const { data: highestIdData } = await supabase
 .from('profiles')
 .select('erp_id')
 .ilike('erp_id', \`\${prefix}%\`)
 .order('erp_id', { ascending: false })
 .limit(1);`;

const newIdQuery = ` const { data: highestIdData } = await supabase
 .from('admissions_applications')
 .select('erp_id')
 .ilike('erp_id', \`\${prefix}%\`)
 .not('erp_id', 'is', null)
 .order('erp_id', { ascending: false })
 .limit(1);`;

if(content.includes(targetIdQuery)) {
    content = content.replace(targetIdQuery, newIdQuery);
    fs.writeFileSync(file, content);
    console.log('done');
} else {
    console.log('not found');
}
