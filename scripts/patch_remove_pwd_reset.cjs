const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx';
let content = fs.readFileSync(file, 'utf8');

// Remove import
content = content.replace(/import AdminPasswordResetsModal from '\.\/AdminPasswordResetsModal';\n/, '');

// Remove state
content = content.replace(/const \[showPasswordResetsModal, setShowPasswordResetsModal\] = useState\(false\);\n/, '');

// Remove button (find exact string block)
const buttonRegex = /\s*<button type="button"\s*onClick=\{\(\) => setShowPasswordResetsModal\(true\)\}\s*className="[^"]*"\s*>\s*<i className="fa-solid fa-unlock-keyhole text-base"><\/i> Password Resets\s*<\/button>\n/g;
content = content.replace(buttonRegex, '\n');

// Remove rendering
const modalRegex = /\s*\{showPasswordResetsModal && \(\s*<AdminPasswordResetsModal onClose=\{\(\) => setShowPasswordResetsModal\(false\)\} \/>\s*\)\}\n/g;
content = content.replace(modalRegex, '\n');

fs.writeFileSync(file, content);
