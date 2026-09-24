const fs = require('fs');

// 1. Revert StudentProgressCard
let progressCard = fs.readFileSync('Frontend/ERP/components/Student/StudentProgressCard/StudentProgressCard.jsx', 'utf8');
progressCard = progressCard.replace(
  ".select('*, cohort_subjects(master_subjects(name, code)), profiles:faculty_id(full_name)')",
  ".select('*, master_subjects:subject_id(name, code), profiles:faculty_id(full_name)')"
);
progressCard = progressCard.replace(
  "{mark.cohort_subjects?.master_subjects?.name || 'Unknown Subject'}",
  "{mark.master_subjects?.name || 'Unknown Subject'}"
);
progressCard = progressCard.replace(
  "{mark.cohort_subjects?.master_subjects?.code}",
  "{mark.master_subjects?.code}"
);
fs.writeFileSync('Frontend/ERP/components/Student/StudentProgressCard/StudentProgressCard.jsx', progressCard);

// 2. Fix Attendance.jsx
let attendance = fs.readFileSync('Frontend/ERP/components/Student/Attendance/Attendance.jsx', 'utf8');
attendance = attendance.replace(
  /session:class_sessions\(id, date, status, schedule_id, batch_id\)/g,
  'session:class_sessions(id, date, status, schedule_id, subject_id)'
);
attendance = attendance.replace(
  /record\.session\.batch_id/g,
  'record.session.subject_id'
);
fs.writeFileSync('Frontend/ERP/components/Student/Attendance/Attendance.jsx', attendance);
console.log("Reverted and fixed.");
