const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update the loop in fetchTodayClasses to include completed sessions
const loopRegex = /if \(\!sessionExists\) \{([\s\S]*?)\} else if \(sessionExists\.status \!\=\= 'completed'\) \{([\s\S]*?)\}/;
const newLoop = `if (!sessionExists) {
                            missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, sch_id: sch.id, subject: cs.master_subjects, isMarked: false });
                        } else if (sessionExists.status !== 'completed') {
                            missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, status: sessionExists.status, sch_id: sch.id, subject: cs.master_subjects, session_id: sessionExists.id, isMarked: false });
                        } else {
                            missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, status: sessionExists.status, sch_id: sch.id, subject: cs.master_subjects, session_id: sessionExists.id, isMarked: true });
                        }`;
content = content.replace(loopRegex, newLoop);

// 2. Update the Sidebar Tab Name
content = content.replace(
    /\{ id: "unmarked", label: "Unmarked", icon: "fa-clipboard-question" \},/,
    `{ id: "unmarked", label: "Past Classes", icon: "fa-clock-rotate-left" },`
);

// 3. Update the rendered UI inside activeTab === 'unmarked'
const uiRegex = /\{activeTab === 'unmarked' && \(([\s\S]*?)Unmarked Dates \(Last 30 Days\)([\s\S]*?)\{selectedUnmarkedSubject\.missed\.map\(\(m, idx\) => \(([\s\S]*?)<button type="button" onClick=\{\(\) => handleResolveUnmarked\(m\)\}([\s\S]*?)<i className="fa-solid fa-pen-nib"><\/i> Mark Now<\/button>([\s\S]*?)\(unmarkedSubjects\.length === 0([\s\S]*?)All Caught Up!([\s\S]*?)You have no unmarked attendance([\s\S]*?)\{sub\.missed\.length\} Missing/g;

// To do this safely, I will use targeted string replacements.
