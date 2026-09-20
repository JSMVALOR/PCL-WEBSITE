const fs = require('fs');
const file = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(file, 'utf8');

// First replace the header to add the toggle
const headerRegex = /<button type="button" onClick=\{refreshLiveAttendance\}.*?<\/button>/s;
if (headerRegex.test(content)) {
    const replacementHeader = `
 <button type="button" onClick={() => setIsSwipeMode(!isSwipeMode)} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 rounded-xl hover:text-emerald-500 text-[#8E8E93] shadow-sm transition-all hover:scale-105 active:scale-95" title={isSwipeMode ? "Switch to List View" : "Switch to Tinder Swipe View"}>
 <i className={\`fa-solid \${isSwipeMode ? 'fa-list-ul' : 'fa-layer-group'}\`}></i>
 </button>
 <button type="button" onClick={refreshLiveAttendance} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 rounded-xl hover:text-[#007AFF] text-[#8E8E93] shadow-sm transition-all hover:scale-105 active:scale-95" title="Sync live OTP entries">
 <i className="fa-solid fa-rotate-right"></i>
 </button>
`;
    content = content.replace(headerRegex, replacementHeader.trim());
}

// Then wrap the list in isSwipeMode condition
const listRegex = /\{filteredStudents\.map\(\(student, index\) => \{\n const record.*?<\/SwipeRow>\n \);\n \}\)\}/s;

if (listRegex.test(content)) {
    content = content.replace(listRegex, match => {
        return `{isSwipeMode ? (
    <SwipeableRosterDeck 
        students={filteredStudents} 
        attendanceRecords={attendanceRecords} 
        onMarkAttendance={updateAttendance} 
    />
) : (
    <>
${match}
    </>
)}`;
    });
    fs.writeFileSync(file, content);
    console.log("Patched mode toggle successfully!");
} else {
    console.log("Could not find list block for mode wrapping");
}
