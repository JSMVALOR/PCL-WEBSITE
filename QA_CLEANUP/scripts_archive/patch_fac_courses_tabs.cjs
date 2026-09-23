const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
`{ id: "overview", label: "Overview", icon: "fa-chart-simple" },
                                        { id: "attendance", label: "Attendance", icon: "fa-clipboard-user" },
                                        { id: "assignments", label: "Assignments", icon: "fa-file-signature" },
                                        { id: "marks", label: "Marks Ledger", icon: "fa-lock" },
                                        { id: "roster", label: "Class Roster", icon: "fa-users-viewfinder" },
                                        { id: "resources", label: "Resources", icon: "fa-google-drive" }`,
`{ id: "overview", label: "Overview", icon: "fa-chart-simple" },
                                        { id: "attendance", label: "Attendance & Roster", icon: "fa-users-viewfinder" },
                                        { id: "assignments", label: "Assignments", icon: "fa-file-signature" },
                                        { id: "marks", label: "Marks Ledger", icon: "fa-lock" },
                                        { id: "resources", label: "Resources", icon: "fa-google-drive" }`
);

c = c.replace(
`{activeSidebarTab === "roster" && (
                                    <div className="-m-4 lg:-m-8">
                                        <ClassRoster subjectContext={selectedCourse} />
                                    </div>
                                )}`,
''
);

fs.writeFileSync(p, c);
console.log("Merged roster tab into attendance");
