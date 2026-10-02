const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/lib/emailtemplate.js', 'utf8');

file = file.replace(
  /\<p\>Dear \$\{params\.student_name \|\| 'Student'\},?\<\/p\>/g,
  '<p>Dear ${params.name || params.student_name || "User"},</p>'
);

fs.writeFileSync('Frontend/ERP/lib/emailtemplate.js', file);
