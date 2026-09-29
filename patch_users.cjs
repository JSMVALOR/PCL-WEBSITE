const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{user\.avatar_url && user\.avatar_url !== 'https:\/\/cdn-icons-png\.flaticon\.com\/512\/3135\/3135715\.png' \? \([\s\S]*?\) : \([\s\S]*?\)\}/g, 
    `<img src={getAvatarUrl({ name: user.name, avatar_url: user.avatar_url })} alt={user.name} onError={(e) => { e.target.onerror = null; e.target.src = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(user.name)}&background=random&color=fff&rounded=true&bold=true\`; }} className="w-20 h-20 rounded-[1.25rem] object-cover mb-4 border-4 border-black/5 dark:border-white/5 shadow-sm group-hover:scale-105 transition-transform duration-300" />`
);

// Wait, the regex above will ruin the sizing for list view. List view uses w-10 h-10.
// Let's do it safer.
