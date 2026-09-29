const fs = require('fs');

function patchFile(file, regex, replaceStr) {
    if(!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Auto import PageHeader if it uses it but doesn't have it
    if(!content.includes('import PageHeader') && !file.includes('AdminNotices.jsx')) {
        // Find last import
        const lastImportIndex = content.lastIndexOf('import ');
        if(lastImportIndex !== -1) {
            const endOfLine = content.indexOf('\n', lastImportIndex);
            
            // Resolve relative path
            let relativePath = '../../shared/PageHeader/PageHeader';
            if(file.includes('AcademicCalendarGrid.jsx')) relativePath = '../../shared/PageHeader/PageHeader';
            if(file.includes('FacultyAssignments.jsx')) relativePath = '../../shared/PageHeader/PageHeader';
            if(file.includes('AdminMarksController.jsx')) relativePath = '../../shared/PageHeader/PageHeader';

            content = content.slice(0, endOfLine + 1) + `import PageHeader from "${relativePath}";\n` + content.slice(endOfLine + 1);
        }
    }

    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
}

// 1. AdminMarksController.jsx
patchFile(
    'Frontend/ERP/components/Admin/AdminMarksController/AdminMarksController.jsx',
    /<div className="relative w-full overflow-hidden border-b border-black\/\[0\.04\].*?bg-gradient-to-r from-themeAccent\/5 via-transparent.*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/s,
    `<div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">
        <PageHeader 
            icon="fa-solid fa-building-columns" 
            title="OU Marks Dispatcher" 
            subtitle="Track faculty submissions & generate exports" 
        />
    </div>`
);

// 2. FacultyAssignments.jsx
patchFile(
    'Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx',
    /<div className="relative w-full overflow-hidden border-b border-black\/\[0\.04\].*?bg-gradient-to-r from-themeAccent\/5 via-transparent.*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/s,
    `<div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">
        <PageHeader 
            icon="fa-solid fa-file-signature" 
            title="Assignment Engine" 
            subtitle="Manage offline submissions" 
        />
    </div>`
);

// 3. AcademicCalendarGrid.jsx
// This one has border border-black/[0.04] and rounded-3xl
patchFile(
    'Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx',
    /<div className="relative w-full overflow-hidden border border-black\/\[0\.04\].*?bg-gradient-to-r from-themeAccent\/5 via-transparent.*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/s,
    `<div className="w-full">
        <PageHeader 
            icon="fa-solid fa-table-cells" 
            title="Calendar Grid" 
            subtitle="Dynamic Spreadsheet Interface" 
            rightContent={<div className="flex gap-2"></div>}
        />
    </div>`
);
// Wait, AcademicCalendarGrid has rightContent: buttons!
// Let's check AcademicCalendarGrid's original right content.
