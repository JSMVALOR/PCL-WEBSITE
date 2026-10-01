const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/ABOUT/FacultyProfile.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldLogic = `  const availableTabs = useMemo(() => {
    if (!faculty) return [];
    return ALL_TABS.filter((tab) => {
        const val = faculty[tab.id];
        // Ensure string length > 0 if it's stored as text
        return typeof val === 'string' && val.trim().length > 0;
    });
  }, [faculty]);`;

const newLogic = `  const availableTabs = useMemo(() => {
    if (!faculty) return [];
    return ALL_TABS.filter((tab) => {
        const val = faculty[tab.id];
        if (!val) return false;
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === 'string') return val.trim().length > 0;
        return false;
    });
  }, [faculty]);`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(file, content);
