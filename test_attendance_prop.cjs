const fs = require('fs');
let path = 'src/ERP/components/Student/Attendance/Attendance.jsx';
let content = fs.readFileSync(path, 'utf8');

// Modify it to accept a menteeId prop
content = content.replace(
    /export default function Attendance\(\) \{/,
    `export default function Attendance({ menteeId }) {`
);

content = content.replace(
    /const targetUserId = userSession\?.db_id;/g,
    `const targetUserId = menteeId || userSession?.db_id;`
);

// If there's no targetUserId definition, we need to inject it.
if (!content.includes('targetUserId')) {
    content = content.replace(
        /const \{ userSession \} = useERP\(\);/,
        `const { userSession } = useERP();\n    const targetUserId = menteeId || userSession?.db_id;`
    );
    // Replace all userSession.db_id with targetUserId in supabase queries.
    content = content.replace(/userSession\?.db_id/g, 'targetUserId');
    // Revert the one we just injected:
    content = content.replace(/const targetUserId = menteeId \|\| targetUserId;/, 'const targetUserId = menteeId || userSession?.db_id;');
}

fs.writeFileSync(path, content);
console.log("Patched Attendance.jsx to support menteeId");
