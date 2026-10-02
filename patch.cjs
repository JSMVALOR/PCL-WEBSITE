const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx', 'utf8');

// 1. Add getAvatarUrl import
if (!code.includes('import { getAvatarUrl }')) {
  code = code.replace("import { getLocalAvatar } from '../../../utils/avatarUtils';", "import { getLocalAvatar, getAvatarUrl } from '../../../utils/avatarUtils';");
}

// 2. Fix the padding wrapper
code = code.replace(
  '<div className="w-full max-w-[1800px] mx-auto flex flex-col pb-10 lg:pb-10 xl:pb-8">', 
  '<div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col pb-10 lg:pb-10 xl:pb-8">'
);

// 3. Remove redundant padding from PageHeader wrapper since we added it to the parent
code = code.replace(
  '<div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">',
  '<div className="mt-4 sm:mt-6 lg:mt-8 w-full">'
);

// 4. Update the avatar src
const imgRegex = /<img\s+src=\{\s*m\.profile_picture_url[\s\S]*?\}\s*alt=\{m\.full_name\}\s*className="w-full h-full object-cover"\s*\/>/g;
code = code.replace(imgRegex, '<img src={getAvatarUrl(m)} alt={m.full_name} className="w-full h-full object-cover" />');

// 5. Update the selected mentee avatar block
const menteeHeaderRegex = /<div className="w-12 h-12 rounded-2xl bg-amber-500\/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-black">\s*\{selectedMentee\.full_name\.charAt\(0\)\}\s*<\/div>/g;
code = code.replace(menteeHeaderRegex, '<div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-black overflow-hidden shrink-0">\n <img src={getAvatarUrl(selectedMentee)} alt={selectedMentee.full_name} className="w-full h-full object-cover" />\n </div>');

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx', code);
console.log("Patched successfully");
