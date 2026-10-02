import re

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

old_end = """ {filteredStudents.length === 0 && (
 <div className="text-center py-20 text-themeTextSec text-[13px] font-medium">No students found in this roster.</div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 );
})()}"""

new_end = """ {filteredStudents.length === 0 && (
 <div className="text-center py-20 text-themeTextSec text-[13px] font-medium">No students found in this roster.</div>
 )}
 </div>
 </div>
 </div>
 </div>
 )}"""

content = content.replace(old_end, new_end)

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)
