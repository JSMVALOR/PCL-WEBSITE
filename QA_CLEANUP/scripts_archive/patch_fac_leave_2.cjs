const fs = require('fs');
const path = 'src/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx';
let content = fs.readFileSync(path, 'utf8');

const balanceUI = `
                            {leaveType && (
                                <div className="mt-2 text-xs font-medium text-gray-500 dark:text-white/60 bg-black/5 dark:bg-white/5 p-3 rounded-xl flex items-center justify-between border border-black/5 dark:border-white/5">
                                    <span>Available Balance:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {(() => {
                                            let used = 0;
                                            leaveHistory.forEach(l => {
                                                if (l.leave_type === leaveType && (l.status === 'approved' || l.status === 'pending')) {
                                                    const s = new Date(l.from_date);
                                                    const e = new Date(l.to_date);
                                                    used += Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
                                                }
                                            });
                                            if (leaveType === 'Casual Leave (CL)') {
                                                const accrued = new Date().getMonth() + 1;
                                                return \`\${Math.max(0, accrued - used)} Days (Accrued: \${accrued}/12, Used: \${used})\`;
                                            }
                                            if (leaveType === 'On Duty (OD)') return \`\${Math.max(0, 30 - used)} Days (Used: \${used}/30)\`;
                                            if (leaveType === 'Winter Vacation' || leaveType === 'Summer Vacation') return \`\${Math.max(0, 15 - used)} Days (Used: \${used}/15)\`;
                                            if (leaveType === 'Earned Leave (EL)') return \`Rollover Based (Used: \${used})\`;
                                            if (leaveType === 'Loss of Pay (LOP)') return \`Unlimited (Used: \${used})\`;
                                            return 'Unknown';
                                        })()}
                                    </span>
                                </div>
                            )}
`;

// Insert it right after the Leave Category dropdown
const target = '<i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 pointer-events-none text-xs"></i>\n                                </div>';

content = content.replace(target, target + balanceUI);
fs.writeFileSync(path, content);
console.log("Balance UI successfully injected.");
