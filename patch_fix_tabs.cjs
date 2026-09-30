const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/ABOUT/FacultyProfile.jsx';
let content = fs.readFileSync(file, 'utf8');

// Remove the problematic useEffect from the top
const badCode = `const [faculty, setFaculty] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (availableTabs.length > 0 && !activeTab) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);`;

const cleanCode = `const [faculty, setFaculty] = useState(null);\n  const [activeTab, setActiveTab] = useState(null);`;

content = content.replace(badCode, cleanCode);

// Insert the useEffect AFTER availableTabs
const targetAnchor = `  const availableTabs = useMemo(() => {
    if (!faculty) return [];
    return ALL_TABS.filter((tab) => {
        const val = faculty[tab.id];
        // Ensure string length > 0 if it's stored as text
        return typeof val === 'string' && val.trim().length > 0;
    });
  }, [faculty]);`;

const replacement = targetAnchor + `\n\n  useEffect(() => {\n    if (availableTabs.length > 0 && !activeTab) {\n      setActiveTab(availableTabs[0].id);\n    }\n  }, [availableTabs, activeTab]);`;

content = content.replace(targetAnchor, replacement);

fs.writeFileSync(file, content);
