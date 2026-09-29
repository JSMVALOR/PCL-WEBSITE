const fs = require('fs');
const file = 'Frontend/ERP/components/shared/ToastContainer.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /useEffect\(\(\) => \{\n\s*registerToastContainer\(\(toast\) => \{\n\s*setToasts\(prev => \[\.\.\.prev, toast\]\);\n\s*\}\);\n\s*\}, \[\]\);/,
    `useEffect(() => {
        registerToastContainer((toast) => {
            setToasts(prev => [...prev, toast]);
        });
        return () => registerToastContainer(null);
    }, []);`
);

fs.writeFileSync(file, content);
