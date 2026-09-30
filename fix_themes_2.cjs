const fs = require('fs');
let file = 'Frontend/ERP/components/Student/Credentials/AppearanceSettings.jsx';
let content = fs.readFileSync(file, 'utf8');

// We need to import useEffect
if (!content.includes('useEffect')) {
    content = content.replace('import React from "react";', 'import React, { useEffect, useState } from "react";');
}

// Add resize listener and fallback logic
content = content.replace(
    /const isMobile = typeof window !== 'undefined' && window\.innerWidth < 768;\n    const themes = isMobile \? allThemes\.slice\(0, 2\) : allThemes;/,
    `const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
    
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const themes = isMobile ? allThemes.slice(0, 2) : allThemes;
    
    useEffect(() => {
        if (isMobile && !themes.find(t => t.id === activeTheme)) {
            changeTheme(themes[0].id);
        }
    }, [isMobile, activeTheme, themes, changeTheme]);`
);

fs.writeFileSync(file, content);
