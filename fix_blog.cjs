const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/BlogManager/BlogManager.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /const handleApproveERP = async \(blog\) => \{/,
    `const handleApproveERP = async (blog) => {
    if (!(await window.erpDialog?.confirm("Publish this blog to the public website?", "Approve Blog"))) return;`
);

content = content.replace(
    /const handleRejectERP = async \(blog\) => \{/,
    `const handleRejectERP = async (blog) => {
    if (!(await window.erpDialog?.confirm("Permanently reject and delete this blog post?", "Reject Blog"))) return;`
);

fs.writeFileSync(file, content);
