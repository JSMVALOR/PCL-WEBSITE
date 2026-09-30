const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/AdminFees/AdminFees.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Rename tabs
const oldTabs = `  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
    { id: 'verifications', label: 'Verifications', icon: 'fa-shield-check' },
    { id: 'batch', label: 'Batch Manager', icon: 'fa-users' },
    { id: 'invoice_history', label: 'Invoice History', icon: 'fa-clock-rotate-left' },
    { id: 'payroll', label: 'Payroll', icon: 'fa-money-check-dollar' }
  ];`;

const newTabs = `  const tabs = [
    { id: 'overview', label: 'Finance Hub', icon: 'fa-chart-pie' },
    { id: 'verifications', label: 'Txn Verifications', icon: 'fa-shield-check' },
    { id: 'batch', label: 'Student Billing', icon: 'fa-users-rectangle' },
    { id: 'invoice_history', label: 'Billing History', icon: 'fa-clock-rotate-left' },
    { id: 'payroll', label: 'Faculty Payroll', icon: 'fa-money-check-dollar' }
  ];`;
content = content.replace(oldTabs, newTabs);

// 2. Add customAmounts state
const stateAdd = `  const [assignDueDate, setAssignDueDate] = useState('');
  const [customAmounts, setCustomAmounts] = useState({});`;
content = content.replace(/  const \[assignDueDate, setAssignDueDate\] = useState\(''\);/, stateAdd);

// 3. Update handleAssignFee to use customAmounts
const oldHandleAssign = `  const handleAssignFee = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const inserts = students.map(s => ({ student_id: s.id,
        title: assignTitle,
        amount: assignAmount,
        due_date: assignDueDate,
        status: 'pending'
      }));`;

const newHandleAssign = `  const handleAssignFee = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const inserts = students.map(s => {
          const finalAmount = customAmounts[s.id] !== undefined ? customAmounts[s.id] : assignAmount;
          return {
            student_id: s.id,
            title: assignTitle,
            amount: finalAmount,
            due_date: assignDueDate,
            status: 'pending'
          };
      });`;
content = content.replace(oldHandleAssign, newHandleAssign);

// 4. Update the Batch UI to show custom inputs
const oldStudentCard = `                      <div 
                        key={s.id} 
                        onClick={() => pendingInv.length > 0 && setSelectedStudentIds(prev => isSelected ? prev.filter(id => id !== s.id) : [...prev, s.id])}
                        className={\`bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border \${isSelected ? 'border-emerald-500' : 'border-themeBorder dark:border-white/5'} rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-colors hover:bg-white/5\`}
                      >
                        <div>
                          <h4 className="text-sm font-black text-themeText dark:text-white">{s.full_name}</h4>
                          <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50">{s.erp_id}</p>
                        </div>
                        <div className="text-right">
                          {pendingInv.length > 0 ? (
                            <span className="text-xs font-black text-rose-500 font-mono">Dues: ₹{pendingInv.reduce((a,b)=>a+Number(b.amount),0)}</span>
                          ) : (
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest"><i className="fa-solid fa-check-circle"></i> Clear</span>
                          )}
                        </div>
                      </div>`;

const newStudentCard = `                      <div 
                        key={s.id} 
                        className={\`bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border \${isSelected ? 'border-emerald-500' : 'border-themeBorder dark:border-white/5'} rounded-2xl p-4 flex flex-col gap-2 transition-colors hover:bg-white/5\`}
                      >
                        <div className="flex justify-between items-start cursor-pointer" onClick={() => pendingInv.length > 0 && setSelectedStudentIds(prev => isSelected ? prev.filter(id => id !== s.id) : [...prev, s.id])}>
                            <div>
                            <h4 className="text-sm font-black text-themeText dark:text-white">{s.full_name}</h4>
                            <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50">{s.erp_id}</p>
                            </div>
                            <div className="text-right">
                            {pendingInv.length > 0 ? (
                                <span className="text-xs font-black text-rose-500 font-mono">Dues: ₹{pendingInv.reduce((a,b)=>a+Number(b.amount),0)}</span>
                            ) : (
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest"><i className="fa-solid fa-check-circle"></i> Clear</span>
                            )}
                            </div>
                        </div>
                        
                        {/* Adjust / Scholarship Override */}
                        {assignAmount && pendingInv.length === 0 && (
                            <div className="mt-2 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                                <span className="text-[9px] font-bold text-themeTextSec dark:text-white/40 uppercase tracking-widest"><i className="fa-solid fa-tags text-amber-500"></i> Exception</span>
                                <input 
                                    type="number" 
                                    placeholder={\`Default: ₹\${assignAmount}\`}
                                    value={customAmounts[s.id] !== undefined ? customAmounts[s.id] : ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setCustomAmounts(prev => {
                                            const next = {...prev};
                                            if (val === '') delete next[s.id];
                                            else next[s.id] = val;
                                            return next;
                                        });
                                    }}
                                    className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono font-black w-24 outline-none focus:border-amber-500 text-themeText dark:text-white"
                                />
                            </div>
                        )}
                      </div>`;
content = content.replace(oldStudentCard, newStudentCard);

fs.writeFileSync(file, content);
