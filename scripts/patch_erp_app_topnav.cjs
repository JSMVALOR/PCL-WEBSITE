const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/ErpApp.jsx', 'utf8');

const hook = `<div className="hidden lg:block">
 <TopNav userSession={userSession} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
 </div>`;
const fixed = `<TopNav userSession={userSession} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />`;

file = file.replace(hook, fixed);
fs.writeFileSync('Frontend/ERP/ErpApp.jsx', file);
