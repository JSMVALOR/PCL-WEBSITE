import re

files_hold_huge = [
    "src/ERP/components/Admin/AdminTimetableBuilder/tabs/components/SyllabusEditorModal.jsx",
    "src/ERP/components/Admin/AdminTimetableBuilder/tabs/BatchManager.jsx",
    "src/ERP/components/Admin/AdminAcademicHub/AdminBatchManager.jsx",
    "src/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleManager.jsx",
    "src/ERP/components/Admin/BlogManager/BlogManager.jsx",
    "src/ERP/components/Admin/AdminTimetableBuilder/tabs/SubjectBuilder.jsx",
    "src/ERP/components/Admin/AdminWebsiteHub/AdminCareers.jsx",
    "src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx",
    "src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx",
    "src/ERP/components/Admin/AdminAcademicCalendar/AdminAcademicCalendar.jsx",
    "src/ERP/components/Admin/notices/AdminNotices.jsx",
    "src/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx",
    "src/ERP/components/Admin/AdminFees/AdminFees.jsx",
    "src/ERP/components/shared/IntelligentBot.jsx",
    "src/ERP/components/notices/EventsBoard.jsx"
]

for file in files_hold_huge:
    try:
        with open(file, 'r') as f:
            content = f.read()
            
        depth = file.count('/') - 1
        prefix = "../" * depth
        
        if "HoldButton" not in content[:500]:
            imports = f"\nimport HoldButton from '{prefix}Shared/components/ReactBits/HoldButton/HoldButton';\nimport {{ HugeiconsIcon }} from '@hugeicons/react';\nimport {{ Delete02Icon }} from '@hugeicons/core-free-icons';\n"
            content = re.sub(r'(import React.*?;\n)', r'\1' + imports, content, count=1)
            
            with open(file, 'w') as f:
                f.write(content)
    except FileNotFoundError:
        pass

# Fix NotFound404
f404 = "src/Website/components/NAVBAR/ABOUT/LeadershipProfile/LeadershipProfile.jsx"
try:
    with open(f404, 'r') as f:
        c = f.read()
    if "NotFound404" not in c[:500]:
        c = re.sub(r'(import React.*?;\n)', r'\1\nimport NotFound404 from "../../../../NotFound404";\n', c, count=1)
        with open(f404, 'w') as f:
            f.write(c)
except: pass

# Fix CodeSlots
fatt = "src/ERP/components/Student/Attendance/Attendance.jsx"
try:
    with open(fatt, 'r') as f:
        c = f.read()
    if "CodeSlots" not in c[:500]:
        c = re.sub(r'(import React.*?;\n)', r'\1\nimport CodeSlots from "../../../../Shared/components/ReactBits/CodeSlots/CodeSlots";\n', c, count=1)
        with open(fatt, 'w') as f:
            f.write(c)
except: pass

