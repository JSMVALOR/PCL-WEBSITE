const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx', 'utf8');

// 1. Fix the payload to reset late_minutes if Waived
file = file.replace(
  /status: newStatus,(\s*)\};/g,
  "status: newStatus,\n        late_minutes: (newStatus === 'On Time' || newStatus === 'present') ? 0 : undefined\n      };"
);

// 2. Fix the source display rendering
file = file.replace(
  /\{fac\.source === 'auto_class' \? '\(Auto: Class Taken\)' : '\(Manual Override\)'\}/g,
  "{fac.source === 'auto_class' ? '(Auto: Class Taken)' : fac.source.includes('WebClock') ? `(${fac.source})` : '(Manual Override)'}"
);

// 3. Add the "Waive Late" button
const actionButtonsStr = `{fac.status !== 'present' && (`;
const actionButtonsNewStr = `{fac.source && fac.source.includes('Late') && (
                        <button 
                          onClick={() => handleMarkStatus(fac.id, 'On Time', 'Late')}
                          disabled={actionLoading === fac.id}
                          className="w-8 h-8 rounded-lg bg-themeElevated hover:bg-emerald-500/20 text-themeTextSec hover:text-emerald-500 transition-colors flex items-center justify-center border border-transparent hover:border-emerald-500/30"
                          title="Waive Late Penalty (Mark On Time)"
                        >
                          {actionLoading === fac.id ? <i className="fa-solid fa-spinner fa-spin text-[10px]"></i> : <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>}
                        </button>
                      )}
                      {fac.status !== 'present' && (`;

file = file.replace(actionButtonsStr, actionButtonsNewStr);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx', file);
console.log("Patched AdminFacultyAttendance!");
