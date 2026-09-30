const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminClinicsHub/AdminClinicsHub.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldLine = 'className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${\n                                activeTab === tab.id \n                                    ? \'bg-themeAccent text-white shadow-lg scale-100\' \n                                    : \'text-themeTextSec hover:text-themeText hover:bg-black/5 dark:hover:bg-white/5 scale-95 hover:scale-100\'\n                            }`}';

const newLine = 'className={[\n                                "px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2",\n                                activeTab === tab.id\n                                    ? "bg-themeAccent text-white shadow-lg scale-100"\n                                    : "text-themeTextSec hover:text-themeText hover:bg-black/5 dark:hover:bg-white/5 scale-95 hover:scale-100"\n                            ].join(" ")}';

content = content.replace(oldLine, newLine);
fs.writeFileSync(file, content);
