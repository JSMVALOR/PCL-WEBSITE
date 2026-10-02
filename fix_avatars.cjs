const fs = require('fs');

const filesToPatch = [
    'Frontend/ERP/components/Student/Mentorship/Mentorship.jsx',
    'Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx',
    'Frontend/ERP/components/shared/BirthdayWidget.jsx',
    'Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx',
    'Frontend/ERP/components/shared/OrganizationDirectory/OrganizationDirectory.jsx',
    'Frontend/ERP/components/shared/AssistantWidget.jsx',
    'Frontend/ERP/components/Parent/ParentDashboard/ParentDashboard.jsx'
];

for (const file of filesToPatch) {
    if (!fs.existsSync(file)) {
        console.log("Missing:", file);
        continue;
    }
    let code = fs.readFileSync(file, 'utf8');

    // 1. Replace import
    code = code.replace(/import\s*\{\s*getLocalAvatar\s*\}\s*from\s*['"]([^'"]+)['"];/g, "import { getAvatarUrl } from '$1';");

    // 2. Replace complicated inline src logic with simple getAvatarUrl(object)
    // Because different files use different variable names (mentorData, fac, person, userSession, member, studentData),
    // we can use a regex to match the <img src={...} /> or style={{ backgroundImage: `url(...)` }} if they have it.
    
    // Pattern: 
    // mentorData.profile_picture_url || getLocalAvatar(mentorData.full_name) ? (mentorData.profile_picture_url || getLocalAvatar(mentorData.full_name)) : `https://ui-avatars...`
    // We want to replace it with getAvatarUrl(mentorData)
    // Instead of complex regex, let's target the exact blocks for each file manually or with generic regex.
    
    const imgRegex = /<img[^>]+src=\{([^}]+getLocalAvatar[^}]+)\}[^>]*>/g;
    code = code.replace(imgRegex, (match, srcContent) => {
        // extract the base variable, e.g. mentorData
        const varMatch = srcContent.match(/([a-zA-Z0-9_]+(?:\?\.)?)(?:profile_picture_url|name|full_name)/);
        if (varMatch) {
            const varName = varMatch[1].replace('?.', '');
            return match.replace(srcContent, `getAvatarUrl(${varName})`);
        }
        return match;
    });

    // Special case for SidebarFramework.jsx which uses style backgroundImage
    if (file.includes('SidebarFramework.jsx')) {
        const bgRegex = /backgroundImage:\s*`url\(\$\{([^}]+getLocalAvatar[^}]+)\}\)`/g;
        code = code.replace(bgRegex, (match, srcContent) => {
             const varMatch = srcContent.match(/([a-zA-Z0-9_]+(?:\?\.)?)(?:profile_picture_url|name|full_name)/);
             if (varMatch) {
                 const varName = varMatch[1].replace('?.', '');
                 return `backgroundImage: \`url(\${getAvatarUrl(${varName})})\``;
             }
             return match;
        });
    }

    fs.writeFileSync(file, code);
    console.log("Patched", file);
}
