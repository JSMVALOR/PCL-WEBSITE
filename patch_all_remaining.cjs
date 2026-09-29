const fs = require('fs');

const files = [
    'Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx',
    'Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx',
    'Frontend/ERP/components/Student/Assignments/Assignments.jsx',
    'Frontend/ERP/components/Student/Notices/Notices.jsx',
    'Frontend/ERP/components/Student/Mentorship/Mentorship.jsx',
    'Frontend/ERP/components/notices/EventsBoard.jsx'
];

function determinePath(file) {
    const slashes = file.split('/').length - 1;
    // Frontend/ERP/components/...
    // If it's Frontend/ERP/components/notices/EventsBoard.jsx (4 slashes inside Frontend/ERP),
    // from EventsBoard to PageHeader: ../shared/PageHeader/PageHeader
    
    // It's easier to just count from components
    let relPath = '../../shared/PageHeader/PageHeader';
    if(file.includes('FacultyMentorship')) relPath = '../../shared/PageHeader/PageHeader';
    if(file.includes('FacultyMarks')) relPath = '../../shared/PageHeader/PageHeader';
    if(file.includes('Student/Assignments')) relPath = '../../shared/PageHeader/PageHeader';
    if(file.includes('Student/Notices')) relPath = '../../shared/PageHeader/PageHeader';
    if(file.includes('Student/Mentorship')) relPath = '../../shared/PageHeader/PageHeader';
    if(file.includes('notices/EventsBoard.jsx')) relPath = '../shared/PageHeader/PageHeader';
    
    return relPath;
}

files.forEach(file => {
    if(!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // Add import
    if(!content.includes('import PageHeader')) {
        const lastImportIndex = content.lastIndexOf('import ');
        if(lastImportIndex !== -1) {
            const endOfLine = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, endOfLine + 1) + `import PageHeader from "${determinePath(file)}";\n` + content.slice(endOfLine + 1);
        }
    }

    const regex = /<div className="relative w-full overflow-hidden border-b border-black\/\[0\.04\].*?via-transparent to-transparent py-8 shrink-0">[\s\S]*?<i className="([^"]+)"><\/i>[\s\S]*?<h1[^>]*>([^<]+)<\/h1>\s*<p[^>]*>([^<]+)<\/p>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

    const match = content.match(regex);
    if(match) {
        const icon = match[1];
        const title = match[2];
        const subtitle = match[3];

        const newHeader = `<div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">
    <PageHeader 
        icon="${icon}" 
        title="${title}" 
        subtitle="${subtitle}" 
    />
</div>`;
        content = content.replace(regex, newHeader);
        fs.writeFileSync(file, content);
        console.log(`Patched ${file}`);
    } else {
        console.log(`No match in ${file}`);
    }
});
