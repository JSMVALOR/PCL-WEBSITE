const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'utf8');

const effectStr = `    useEffect(() => {
        if (userSession?.db_id) {
            fetchTodayClasses();
            fetchAllSubjects();
        }
    }, [userSession]);`;

const effectRepl = `    useEffect(() => {
        if (userSession?.db_id) {
            fetchTodayClasses();
            fetchAllSubjects();
        }
    }, [userSession]);

    // Keep selectedUnmarkedSubject in sync with unmarkedSubjects
    useEffect(() => {
        if (selectedUnmarkedSubject) {
            const updated = unmarkedSubjects.find(s => s.id === selectedUnmarkedSubject.id);
            if (updated) {
                setSelectedUnmarkedSubject(updated);
            }
        }
    }, [unmarkedSubjects]);`;

code = code.replace(effectStr, effectRepl);

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', code);
console.log('Patched stale state');
