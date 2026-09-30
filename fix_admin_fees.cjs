const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminFees/AdminFees.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /await supabase\.from\('fee_transactions'\)\.update\(\{ status: 'successful' \}\)\.eq\('id', txn\.id\);/,
    `const { error: tErr } = await supabase.from('fee_transactions').update({ status: 'successful' }).eq('id', txn.id);
      if (tErr) throw tErr;`
);

content = content.replace(
    /await supabase\.from\('fee_invoices'\)\.update\(\{ status: 'paid' \}\)\.eq\('student_id', txn\.student_id\)\.eq\('status', 'under_verification'\);/,
    `const { error: iErr } = await supabase.from('fee_invoices').update({ status: 'paid' }).eq('student_id', txn.student_id).eq('status', 'under_verification');
      if (iErr) throw iErr;`
);

fs.writeFileSync(file, content);
