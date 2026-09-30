const fs = require('fs');
let file = 'Frontend/ERP/context/ErpContext.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /supabase\.auth\.getSession\(\)\.then\(\(\{\s*data:\s*\{\s*session\s*\}\s*\}\) => \{/,
    `supabase.auth.getSession().then(({ data: { session } }) => {`
);

content = content.replace(
    /supabase\.auth\.getSession\(\)\.then\(\(\{\s*data:\s*\{\s*session\s*\}\s*\}\) => \{([\s\S]*?)\}\);/m,
    `supabase.auth.getSession().then(({ data: { session } }) => {$1}).catch(err => {
        console.error("Session get failed:", err);
        if (isMounted) setIsAppLoading(false);
    });`
);

fs.writeFileSync(file, content);
