const fs = require('fs');

function fixFile(path, badSrc, goodSrc) {
  if (!fs.existsSync(path)) return;
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(badSrc, goodSrc);
  fs.writeFileSync(path, code);
}

fixFile('Frontend/ERP/components/Student/Mentorship/Mentorship.jsx', 'src={getAvatarUrl(full_)}&background=random&color=fff&rounded=true&bold=true`', 'src={getAvatarUrl(mentorData)}');
fixFile('Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx', 'src={getAvatarUrl(full_)}&background=random&color=fff&rounded=true&bold=true`', 'src={getAvatarUrl(fac)}');
fixFile('Frontend/ERP/components/shared/BirthdayWidget.jsx', 'src={getAvatarUrl(full_)}&background=random&color=fff&rounded=true&bold=true`', 'src={getAvatarUrl(person)}');
fixFile('Frontend/ERP/components/shared/OrganizationDirectory/OrganizationDirectory.jsx', 'src={getAvatarUrl(full_)}&background=random&color=fff&rounded=true&bold=true`', 'src={getAvatarUrl(member)}');
fixFile('Frontend/ERP/components/Parent/ParentDashboard/ParentDashboard.jsx', 'src={getAvatarUrl(full_)}&background=random&color=fff&rounded=true&bold=true`', 'src={getAvatarUrl(studentData)}');

let sfCode = fs.readFileSync('Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx', 'utf8');
sfCode = sfCode.replace(/src=\{getAvatarUrl\(userSession\)\}&background=random&color=fff&rounded=true&bold=true`/g, 'src={getAvatarUrl(userSession)}');
fs.writeFileSync('Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx', sfCode);

console.log("Syntax fixed");
