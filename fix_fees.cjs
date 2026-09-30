const fs = require('fs');
let file = 'Frontend/ERP/components/Student/Fees/Fees.jsx';
let content = fs.readFileSync(file, 'utf8');

// Insert functions if they don't exist
if (!content.includes('const getFeeTheme')) {
    content = content.replace(
        /export default function Fees\(\) \{/,
        `export default function Fees() {
    const getFeeTheme = (type) => {
        switch(type?.toLowerCase()) {
            case 'tuition': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'library': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'exam': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'hostel': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };
    
    const getFeeIcon = (type) => {
        switch(type?.toLowerCase()) {
            case 'tuition': return 'fa-graduation-cap';
            case 'library': return 'fa-book';
            case 'exam': return 'fa-file-signature';
            case 'hostel': return 'fa-bed';
            default: return 'fa-indian-rupee-sign';
        }
    };
`
    );
}

fs.writeFileSync(file, content);
