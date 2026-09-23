const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldLoop = `                        if (!sessionExists) {
                            missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, sch_id: sch.id, subject: cs.master_subjects });
                        } else if (sessionExists.status !== 'completed') {
                            missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, status: sessionExists.status, sch_id: sch.id, subject: cs.master_subjects, session_id: sessionExists.id });
                        }`;

const newLoop = `                        if (!sessionExists) {
                            missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, sch_id: sch.id, subject: cs.master_subjects, isMarked: false });
                        } else if (sessionExists.status !== 'completed') {
                            missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, status: sessionExists.status, sch_id: sch.id, subject: cs.master_subjects, session_id: sessionExists.id, isMarked: false });
                        } else {
                            missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, status: sessionExists.status, sch_id: sch.id, subject: cs.master_subjects, session_id: sessionExists.id, isMarked: true });
                        }`;

content = content.replace(oldLoop, newLoop);

// Let's also fix the tab label from "Unmarked" to "Past Classes"
content = content.replace(
    /\{ id: "unmarked", label: "Unmarked", icon: "fa-clipboard-question" \},/,
    `{ id: "unmarked", label: "Past Classes", icon: "fa-clock-rotate-left" },`
);

fs.writeFileSync(path, content);
console.log("Patched loop successfully.");
