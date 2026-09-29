const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/shared/TopNav.jsx', 'utf8');

file = file.replace(
    /\{userSession\?\.profile_picture_url \? \([\s\S]*?<img src=\{userSession\.profile_picture_url\} alt="Profile" className="w-full h-full object-cover relative z-10" \/>[\s\S]*?\) : \([\s\S]*?<span className="relative z-10">\{initials\}<\/span>[\s\S]*?\)\}/,
    `{userSession?.profile_picture_url && userSession.profile_picture_url !== 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' ? (
                                    <img src={userSession.profile_picture_url.startsWith('http') ? userSession.profile_picture_url : \`https://ui-avatars.com/api/?name=\${encodeURIComponent(userSession.name || 'US')}&background=random&color=fff&rounded=true&bold=true\`} alt="Profile" className="w-full h-full object-cover relative z-10" />
                                ) : (
                                    <img src={\`https://ui-avatars.com/api/?name=\${encodeURIComponent(userSession?.name || 'US')}&background=random&color=fff&rounded=true&bold=true\`} alt="Profile" className="w-full h-full object-cover relative z-10" />
                                )}`
);

file = file.replace(
    /\{userSession\?\.profile_picture_url \? \([\s\S]*?<img src=\{userSession\.profile_picture_url\} alt="Profile" className="w-full h-full object-cover" \/>[\s\S]*?\) : \([\s\S]*?<span>\{initials\}<\/span>[\s\S]*?\)\}/,
    `{userSession?.profile_picture_url && userSession.profile_picture_url !== 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' ? (
                                                    <img src={userSession.profile_picture_url.startsWith('http') ? userSession.profile_picture_url : \`https://ui-avatars.com/api/?name=\${encodeURIComponent(userSession.name || 'US')}&background=random&color=fff&rounded=true&bold=true\`} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={\`https://ui-avatars.com/api/?name=\${encodeURIComponent(userSession?.name || 'US')}&background=random&color=fff&rounded=true&bold=true\`} alt="Profile" className="w-full h-full object-cover" />
                                                )}`
);

fs.writeFileSync('Frontend/ERP/components/shared/TopNav.jsx', file);
console.log("Updated TopNav.jsx");
