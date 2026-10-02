import re

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

# Add time variables around line 605
time_vars = """ {/* ACTIVE WINDOW VIEW */}
 {activeTab === 'window' && activeSession && (() => {
   const now = new Date();
   const [sh, sm, ss] = (activeSession.classData?.start_time || '00:00:00').split(':');
   const [eh, em, es] = (activeSession.classData?.end_time || '23:59:59').split(':');
   const startTime = new Date(); startTime.setHours(sh, sm, ss, 0);
   const endTime = new Date(); endTime.setHours(eh, em, es, 0);
   
   const p1End = new Date(startTime.getTime() + 15 * 60000);
   const p2Start = new Date(endTime.getTime() - 15 * 60000);
   
   let lockedMsg = null;
   let unlockTime = null;
   let isLocked = false;
   
   if (now < startTime) {
     isLocked = true;
     lockedMsg = "Class hasn't started yet.";
     unlockTime = startTime;
   } else if (attendancePhase === 'entry' && now > p1End) {
     isLocked = true;
     lockedMsg = "Phase 1 is locked. Please wait for Phase 2.";
     unlockTime = p2Start;
   } else if (attendancePhase === 'exit' && now < p2Start) {
     isLocked = true;
     lockedMsg = "Phase 2 is not yet open.";
     unlockTime = p2Start;
   }
   
   return (
 <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 animate-fade-in relative z-10">"""

content = re.sub(r' \{\/\* ACTIVE WINDOW VIEW \*\/\}\n \{activeTab === \'window\' && activeSession && \(\n <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 animate-fade-in relative z-10">', time_vars, content)

# Close the wrapper at the end of window block
# The active window block ends right before {/* RISK ANALYTICS VIEW */}
end_wrapper = """ )}
 </div>
 </div>
 </div>
   );
 })()}

 {/* RISK ANALYTICS VIEW */}"""

content = re.sub(r' \)\}\n \{filteredStudents\.length === 0 && \(\n <div className="text-center py-20 text-themeTextSec text-\[13px\] font-medium">No students found in this roster\.</div>\n \)\}\n </div>\n </div>\n </div>\n \)\}\n\n \{\/\* RISK ANALYTICS VIEW \*\/\}',
""" )}\n {filteredStudents.length === 0 && (\n <div className="text-center py-20 text-themeTextSec text-[13px] font-medium">No students found in this roster.</div>\n )}\n </div>\n </div>\n </div>\n   );\n })()}\n\n {/* RISK ANALYTICS VIEW */}""", content)

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)
