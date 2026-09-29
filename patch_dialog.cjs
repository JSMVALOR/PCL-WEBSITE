const fs = require('fs');
const file = 'Frontend/ERP/components/shared/DialogContainer.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /useEffect\(\(\) => \{\n\s*registerDialogContainer\(setDialogState\);\n\s*\}, \[\]\);/,
    `useEffect(() => {
        registerDialogContainer(setDialogState);
        return () => registerDialogContainer(null);
    }, []);`
);

fs.writeFileSync(file, content);
