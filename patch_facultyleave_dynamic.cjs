const fs = require('fs');

let file = 'Frontend/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add `policies` state and fetch inside useEffect
const addStates = `    const [isSingleDay, setIsSingleDay] = useState(true);
    const [editingLeaveId, setEditingLeaveId] = useState(null);
    const [policies, setPolicies] = useState([]);`;
content = content.replace(/    const \[isSingleDay, setIsSingleDay\] = useState\(true\);\n    const \[editingLeaveId, setEditingLeaveId\] = useState\(null\);/, addStates);

const addFetch = `    useEffect(() => {
        fetchPolicies();
        fetchFaculty();
        fetchLeaveHistory();
    }, [userSession]);

    const fetchPolicies = async () => {
        const { data } = await supabase.from('leave_policies').select('*').eq('status', 'ACTIVE');
        if (data && data.length > 0) {
            setPolicies(data);
            setLeaveType(data[0].name);
        } else {
            // Fallback to static if table not found
            setPolicies([
                { name: 'Casual Leave (CL)', annual_limit: 12, max_consecutive_days: 2 },
                { name: 'Earned Leave (EL)', annual_limit: 15, max_consecutive_days: 15 },
                { name: 'On Duty (OD)', annual_limit: 30, max_consecutive_days: 30 },
                { name: 'Winter Vacation', annual_limit: 15, max_consecutive_days: 15 },
                { name: 'Summer Vacation', annual_limit: 15, max_consecutive_days: 15 },
                { name: 'Loss of Pay (LOP)', annual_limit: 365, max_consecutive_days: 365 }
            ]);
        }
    };`;
// Replace the old useEffect(s) for fetchFaculty and fetchLeaveHistory
content = content.replace(/    useEffect\(\(\) => \{\n        fetchFaculty\(\);\n        fetchLeaveHistory\(\);\n    \}, \[userSession\]\);/, addFetch);


// Fix dropdown mapping
const oldSelect = `<select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl px-4 py-4 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-[#2C2C2E] outline-none transition-all shadow-sm appearance-none cursor-pointer">
 <option value="Casual Leave (CL)">Casual Leave (CL)</option>
 <option value="Earned Leave (EL)">Earned Leave (EL)</option>
 <option value="On Duty (OD)">On Duty (OD)</option>
 <option value="Winter Vacation">Winter Vacation</option>
 <option value="Summer Vacation">Summer Vacation</option>
 <option value="Loss of Pay (LOP)">Loss of Pay (LOP)</option>
 </select>`;
const newSelect = `<select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl px-4 py-4 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-[#2C2C2E] outline-none transition-all shadow-sm appearance-none cursor-pointer">
 {policies.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
 </select>`;
content = content.replace(oldSelect, newSelect);


// Fix the dynamic limits logic
const oldLimitLogic = `        if (leaveType === "Casual Leave (CL)") {
            if (diffDays > 2) {
                setStatusMessage({ type: "error", text: "HR Rule: Maximum 2 Casual Leaves can be combined." });
                setIsSubmitting(false); return;
            }
            const accruedCL = new Date().getMonth() + 1; // 1 per month based on calendar year
            if (usedDays + diffDays > accruedCL) {
                setStatusMessage({ type: "error", text: \`HR Rule: Insufficient balance. Accrued: \${accruedCL}, Used/Requested: \${usedDays}.\` });
                setIsSubmitting(false); return;
            }
        } else if (leaveType === "On Duty (OD)") {
            if (usedDays + diffDays > 30) {
                setStatusMessage({ type: "error", text: \`HR Rule: OD limit exceeded. Max 30 days/year. Used: \${usedDays}.\` });
                setIsSubmitting(false); return;
            }
        } else if (leaveType === "Winter Vacation") {
            if (usedDays + diffDays > 15) {
                setStatusMessage({ type: "error", text: \`HR Rule: Winter Vacation limit exceeded. Max 15 days/year.\` });
                setIsSubmitting(false); return;
            }
        } else if (leaveType === "Summer Vacation") {
            if (usedDays + diffDays > 15) {
                setStatusMessage({ type: "error", text: \`HR Rule: Summer Vacation limit exceeded. Max 15 days/year.\` });
                setIsSubmitting(false); return;
            }
        }`;

const newLimitLogic = `        const activePolicy = policies.find(p => p.name === leaveType);
        if (activePolicy) {
            if (activePolicy.max_consecutive_days && diffDays > activePolicy.max_consecutive_days) {
                setStatusMessage({ type: "error", text: \`HR Rule: Maximum \${activePolicy.max_consecutive_days} consecutive days allowed for \${leaveType}.\` });
                setIsSubmitting(false); return;
            }
            
            // Special handling for Casual Leave accrued monthly
            let limitToCheck = activePolicy.annual_limit;
            if (leaveType === "Casual Leave (CL)") {
                limitToCheck = new Date().getMonth() + 1; // accrued
            }
            
            if (usedDays + diffDays > limitToCheck) {
                setStatusMessage({ type: "error", text: \`HR Rule: Insufficient balance for \${leaveType}. Limit: \${limitToCheck}, Used/Requested: \${usedDays + diffDays}.\` });
                setIsSubmitting(false); return;
            }
        }`;
content = content.replace(oldLimitLogic, newLimitLogic);

// Dynamic Available Balance Text
const oldAvailText = `                                            if (leaveType === 'Casual Leave (CL)') {
                                                const accrued = new Date().getMonth() + 1;
                                                return \`\${Math.max(0, accrued - used)} Days (Accrued: \${accrued}/12, Used: \${used})\`;
                                            }
                                            if (leaveType === 'On Duty (OD)') return \`\${Math.max(0, 30 - used)} Days (Used: \${used}/30)\`;
                                            if (leaveType === 'Winter Vacation' || leaveType === 'Summer Vacation') return \`\${Math.max(0, 15 - used)} Days (Used: \${used}/15)\`;
                                            if (leaveType === 'Earned Leave (EL)') return \`Rollover Based (Used: \${used})\`;
                                            if (leaveType === 'Loss of Pay (LOP)') return \`Unlimited (Used: \${used})\`;
                                            return 'Unknown';`;

const newAvailText = `                                            const p = policies.find(x => x.name === leaveType);
                                            if (!p) return 'Unknown';
                                            if (leaveType === 'Casual Leave (CL)') {
                                                const accrued = new Date().getMonth() + 1;
                                                return \`\${Math.max(0, accrued - used)} Days (Accrued: \${accrued}/\${p.annual_limit}, Used: \${used})\`;
                                            }
                                            return \`\${Math.max(0, p.annual_limit - used)} Days (Used: \${used}/\${p.annual_limit})\`;`;
content = content.replace(oldAvailText, newAvailText);


fs.writeFileSync(file, content);
