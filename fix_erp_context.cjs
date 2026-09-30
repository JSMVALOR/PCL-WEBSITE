const fs = require('fs');
let file = 'Frontend/ERP/context/ErpContext.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the changeTheme logic
content = content.replace(
    /const changeTheme = \(newTheme\) => \{\n        setActiveTheme\(newTheme\);\n    \};/,
    `const changeTheme = (newTheme) => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            if (newTheme !== 'apple-hig-light' && newTheme !== 'midnight-justice') {
                newTheme = 'apple-hig-light'; // Fallback to default mobile light theme
            }
        }
        setActiveTheme(newTheme);
    };`
);

// We should also check when activeTheme is initially set from localStorage.
// But we can just enforce it in the useEffect where it sets data-theme.
content = content.replace(
    /document\.documentElement\.setAttribute\('data-theme', activeTheme\);/,
    `let themeToApply = activeTheme;
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            if (themeToApply !== 'apple-hig-light' && themeToApply !== 'midnight-justice') {
                themeToApply = 'apple-hig-light';
            }
        }
        document.documentElement.setAttribute('data-theme', themeToApply);`
);

fs.writeFileSync(file, content);
