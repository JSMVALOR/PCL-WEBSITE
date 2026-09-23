import re

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

# We need to inject the logic to query leave_requests right after fetching students.
# Let's find: `setEnrolledStudents(students || []);`
# There are two places. Let's just find `// Auto-create absent records for missing students locally first`
# and prepend the leave query.

old_logic = """            // Auto-create absent records for missing students locally first
            students.forEach(s => {
                if (!recordMap[s.id]) {
                    recordMap[s.id] = { student_id: s.id, session_id: currentSession.id, entry_status: 'absent', exit_status: null, isNew: true };
                }
            });"""

new_logic = """            // Auto-create absent records for missing students locally first
            // **AUTO-MARK MEDICAL LEAVE (M) LOGIC**
            let approvedLeaves = [];
            if (students.length > 0) {
                const sessionDateStr = currentSession.date || new Date().toISOString().split('T')[0];
                const { data: leaves } = await supabase
                    .from('leave_requests')
                    .select('student_id, start_date, end_date')
                    .eq('status', 'approved')
                    .in('student_id', students.map(s => s.id));
                if (leaves) {
                    approvedLeaves = leaves.filter(l => {
                        const sD = new Date(l.start_date); sD.setHours(0,0,0,0);
                        const eD = new Date(l.end_date); eD.setHours(23,59,59,999);
                        const cD = new Date(sessionDateStr);
                        return cD >= sD && cD <= eD;
                    }).map(l => l.student_id);
                }
            }

            students.forEach(s => {
                if (!recordMap[s.id]) {
                    const isMedical = approvedLeaves.includes(s.id);
                    recordMap[s.id] = { 
                        student_id: s.id, 
                        session_id: currentSession.id, 
                        entry_status: isMedical ? 'medical' : 'absent', 
                        exit_status: null, 
                        isNew: true 
                    };
                }
            });"""

content = content.replace(old_logic, new_logic)

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)
