const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'utf8');

const legacySyncBlock = `// SYNC TO LEGACY student_marks TABLE FOR ADMIN EXAM LOCKING
        try {
            if (isGenericAssessment && ['Mid-Semester', 'End-Semester', 'Internal'].includes(selectedAssessmentType)) {`;

const legacySyncBlockRepl = `// SYNC TO ASSIGNMENT SUBMISSIONS
        try {
            if (!isGenericAssessment) {
                for (const row of upsertArray) {
                    await supabase.from('assignment_submissions').update({
                        marks_awarded: row.marks_obtained,
                        status: 'Graded'
                    }).eq('assignment_id', row.assignment_id).eq('student_id', row.student_id);
                }
            }
        } catch(e) {
            console.error("Failed to sync assignment submissions", e);
        }

        // SYNC TO LEGACY student_marks TABLE FOR ADMIN EXAM LOCKING
        try {
            if (isGenericAssessment && ['Mid-Semester', 'End-Semester', 'Internal'].includes(selectedAssessmentType)) {`;

code = code.replace(legacySyncBlock, legacySyncBlockRepl);

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', code);
console.log('Patched FacultyMarks sync');
