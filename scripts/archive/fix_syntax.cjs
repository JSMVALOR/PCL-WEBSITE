const fs = require('fs');
let content = fs.readFileSync('Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx', 'utf8');

// The problematic block is:
// ))
// )}
// </div>
// )}

content = content.replace(/\)\)\s*\n\s*\)\}\s*\n\s*<\/div>\s*\n\s*\)\}/g, '    ))}\n    </div>\n)}');

fs.writeFileSync('Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx', content);
