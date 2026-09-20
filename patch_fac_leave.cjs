const fs = require('fs');
const path = 'src/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix payload
content = content.replace('start_date: fromDate,', 'from_date: fromDate,');
content = content.replace('end_date: toDate,', 'to_date: toDate,');

// 2. Fix history calculation
content = content.replace('const s = new Date(l.start_date);', 'const s = new Date(l.from_date);');
content = content.replace('const e = new Date(l.end_date);', 'const e = new Date(l.to_date);');

// 3. Remove hardcoded balances from options
content = content.replace('<option value="Casual Leave (CL)">Casual Leave (CL) [12/yr]</option>', '<option value="Casual Leave (CL)">Casual Leave (CL)</option>');
content = content.replace('<option value="Earned Leave (EL)">Earned Leave (EL) [Rollover]</option>', '<option value="Earned Leave (EL)">Earned Leave (EL)</option>');
content = content.replace('<option value="On Duty (OD)">On Duty (OD) [30/yr]</option>', '<option value="On Duty (OD)">On Duty (OD)</option>');
content = content.replace('<option value="Winter Vacation">Winter Vacation [15/yr]</option>', '<option value="Winter Vacation">Winter Vacation</option>');
content = content.replace('<option value="Summer Vacation">Summer Vacation [15/yr]</option>', '<option value="Summer Vacation">Summer Vacation</option>');

// 4. Calculate total balance for display
// We'll dynamically calculate it right inside the form
const balanceUI = `
                            {leaveType && (
                                <div className="mt-2 text-xs font-medium text-gray-500 dark:text-white/60 bg-black/5 dark:bg-white/5 p-3 rounded-lg flex items-center justify-between">
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

content = content.replace('</div>\n                            </div>\n\n                            <div className="grid grid-cols-2 gap-4">', balanceUI + '\n                            </div>\n\n                            <div className="grid grid-cols-2 gap-4">');

// Also wait, I need to make sure the replacement was correct. 
// "</div>\n                            </div>\n\n                            <div className="grid grid-cols-2 gap-4">" might not perfectly match indentation. Let's use a regex.

fs.writeFileSync(path, content);
console.log("Basic fixes applied.");
