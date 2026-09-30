const fs = require('fs');
let file = 'Frontend/ERP/components/Student/StudentDashboard/StudentDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add loading state
if (!content.includes('const [loading, setLoading] = useState(true);')) {
    content = content.replace(
        /const \[profile, setProfile\] = useState/,
        `const [loading, setLoading] = useState(true);\n    const [profile, setProfile] = useState`
    );
}

// Wrap fetchData in try/catch and use finally for setLoading(false)
content = content.replace(
    /const fetchData = async \(\) => \{([\s\S]*?)\};\n\n    fetchData\(\);/m,
    `const fetchData = async () => {
        try {
$1
        } catch (error) {
            console.error("Dashboard fetch error:", error);
            window.toast?.error("Failed to load some dashboard widgets.");
        } finally {
            setLoading(false);
        }
    };

    fetchData();`
);

fs.writeFileSync(file, content);
