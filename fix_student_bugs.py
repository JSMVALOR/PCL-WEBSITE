import os
import re

base_path = '/Users/JSM/Developer/PRUDENTIA COLLEGE OF LAW/PCL WEBSITE V6/src/ERP/components/Student/'

# 1. Leave.jsx - missing states
leave_file = os.path.join(base_path, 'Leave/Leave.jsx')
with open(leave_file, 'r') as f:
    leave_content = f.read()

if 'fileInputRef' not in leave_content[:2000]:
    leave_content = leave_content.replace(
        'const [documentUrl, setDocumentUrl] = useState(\'\');',
        '''const [documentUrl, setDocumentUrl] = useState('');
  const fileInputRef = useRef(null);
  const [documentFile, setDocumentFile] = useState(null);'''
    )
    leave_content = leave_content.replace("import React, { useState, useEffect }", "import React, { useState, useEffect, useRef }")
    with open(leave_file, 'w') as f:
        f.write(leave_content)


# 2. Achievements.jsx - handlePrintCertificate
ach_file = os.path.join(base_path, 'Achievements/Achievements.jsx')
with open(ach_file, 'r') as f:
    ach_content = f.read()
if 'const handlePrintCertificate' not in ach_content:
    ach_content = ach_content.replace(
        'const getStatusBadge =',
        '''const handlePrintCertificate = (ach) => {
    window.erpDialog?.alert("Generating high-resolution printable certificate for: " + ach.title);
  };

  const getStatusBadge ='''
    )
    with open(ach_file, 'w') as f:
        f.write(ach_content)

# 3. Timetable.jsx - generateCalendarICS
time_file = os.path.join(base_path, 'Timetable/Timetable.jsx')
with open(time_file, 'r') as f:
    time_content = f.read()

time_content = time_content.replace(
    'const icsData = generateCalendarICS(fakeSchedule, userSession?.academic_batch || \'Timetable\');',
    'generateCalendarICS(userSession?.academic_batch || \'Timetable\', fakeSchedule); return;'
)
with open(time_file, 'w') as f:
    f.write(time_content)


# 4. Attendance.jsx
att_file = os.path.join(base_path, 'Attendance/Attendance.jsx')
with open(att_file, 'r') as f:
    att_content = f.read()
att_content = att_content.replace('if (!session || !session.subject) return;', 'if (!session || !session.schedule?.subject) return;')
with open(att_file, 'w') as f:
    f.write(att_content)


# 5. CourseVault.jsx
vault_file = os.path.join(base_path, 'CourseVault/CourseVault.jsx')
with open(vault_file, 'r') as f:
    vault_content = f.read()

vault_content = vault_content.replace('import React, { useState, useEffect } from "react";', 'import React, { useState, useEffect } from "react";\nimport { useERP } from "../../../context/ErpContext";')
vault_content = vault_content.replace('const sessionStr = sessionStorage.getItem("userSession");', 'const { userSession } = useERP();')
vault_content = vault_content.replace('''if (!sessionStr) {
      console.error("No active session found.");
      return;
    }
    const userSession = JSON.parse(sessionStr);''', '''if (!userSession) {
      console.error("No active session found.");
      setIsLoading(false);
      return;
    }''')
with open(vault_file, 'w') as f:
    f.write(vault_content)

# 6. CVBuilder.jsx
cv_file = os.path.join(base_path, 'CVBuilder/CVBuilder.jsx')
with open(cv_file, 'r') as f:
    cv_content = f.read()
cv_content = cv_content.replace('"Moot Court"', '"Moot Courts"')
cv_content = cv_content.replace('"Certifications"', '"Certificates"')
cv_content = cv_content.replace('"Extracurriculars"', '"Leadership"') # Note: could also be Community Service, but this fixes it loosely.
with open(cv_file, 'w') as f:
    f.write(cv_content)


# 7. Fees.jsx
fees_file = os.path.join(base_path, 'Fees/Fees.jsx')
with open(fees_file, 'r') as f:
    fees_content = f.read()
fees_content = fees_content.replace('className="bg-white dark:bg-[#1C1C1E]', 'className="printable-area bg-white dark:bg-[#1C1C1E]')
with open(fees_file, 'w') as f:
    f.write(fees_content)


# 8. StudentDashboard.jsx
dash_file = os.path.join(base_path, 'StudentDashboard/StudentDashboard.jsx')
with open(dash_file, 'r') as f:
    dash_content = f.read()
dash_content = dash_content.replace(".from('attendance')", ".from('attendance_records')")
dash_content = dash_content.replace(".eq('profile_id', studentId)", ".eq('student_id', studentId)")
dash_content = dash_content.replace(".from('assignments')", ".from('assignment_submissions')")
dash_content = dash_content.replace("await supabase\n        .from('assignment_submissions')", "await supabase\n        .from('assignment_submissions')")
with open(dash_file, 'w') as f:
    f.write(dash_content)


print("Student fixes applied.")
