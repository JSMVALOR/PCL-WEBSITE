const fs = require('fs');

function patchLogoCondition(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the specific condition array in the ternary operator
    // Find: (!activeTheme || activeTheme.includes("dark") || activeTheme.includes("midnight") || activeTheme.includes("crimson") || activeTheme.includes("emerald") || activeTheme.includes("imperial") || activeTheme.includes("royal"))
    // Replace with: (!activeTheme || activeTheme.includes("dark") || activeTheme.includes("midnight") || activeTheme.includes("crimson") || activeTheme.includes("marble"))
    
    // For TopNav
    content = content.replace(/\(!activeTheme \|\| activeTheme\.includes\("dark"\) \|\| activeTheme\.includes\("midnight"\) \|\| activeTheme\.includes\("crimson"\) \|\| activeTheme\.includes\("emerald"\) \|\| activeTheme\.includes\("imperial"\)\)/g, 
        '(!activeTheme || activeTheme.includes("dark") || activeTheme.includes("midnight") || activeTheme.includes("crimson") || activeTheme.includes("marble"))'
    );

    // For Login
    content = content.replace(/\(!activeTheme \|\| activeTheme\.includes\("dark"\) \|\| activeTheme\.includes\("midnight"\) \|\| activeTheme\.includes\("crimson"\) \|\| activeTheme\.includes\("emerald"\) \|\| activeTheme\.includes\("imperial"\) \|\| activeTheme\.includes\("royal"\)\)/g, 
        '(!activeTheme || activeTheme.includes("dark") || activeTheme.includes("midnight") || activeTheme.includes("crimson") || activeTheme.includes("marble"))'
    );
    
    fs.writeFileSync(file, content);
}

patchLogoCondition('Frontend/ERP/components/shared/TopNav.jsx');
patchLogoCondition('Frontend/ERP/components/Login/Login.jsx');

