const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyPayroll/FacultyPayroll.jsx';
let c = fs.readFileSync(p, 'utf8');

const stateBlock = `    const [payslips, setPayslips] = useState([]);`;
const newStateBlock = `    const [payslips, setPayslips] = useState([]);
    const [pendingLop, setPendingLop] = useState(0);`;

const fetchBlock = `        const fetchPayroll = async () => {`;
const newFetchBlock = `        const fetchPayroll = async () => {
            try {
                // Fetch this month's LOP leaves for pending deduction calculation
                const currMonthStart = new Date();
                currMonthStart.setDate(1);
                currMonthStart.setHours(0,0,0,0);
                
                const { data: leaves } = await supabase
                    .from('faculty_leaves')
                    .select('days')
                    .eq('faculty_id', facultyId)
                    .eq('leave_type', 'Loss of Pay (LOP)')
                    .in('status', ['approved', 'pending'])
                    .gte('from_date', currMonthStart.toISOString())
                    .catch(() => ({ data: [] }));
                
                if (leaves && leaves.length > 0) {
                    const totalLop = leaves.reduce((sum, l) => sum + (Number(l.days) || 0), 0);
                    if (isMounted) setPendingLop(totalLop);
                }
            } catch (e) {}`;

const gridBlock = `                    <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between group">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                            <i className="fa-solid fa-money-check-dollar text-xl"></i>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white mb-1">{payslips.length}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50">Total Payslips Available</p>
                        </div>
                    </div>`;

const newGridBlock = `                    <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between group">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
                            <i className="fa-solid fa-calendar-minus text-xl"></i>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white mb-1">{pendingLop} <span className="text-sm text-gray-500 dark:text-white/50 font-bold tracking-normal">Days</span></h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50">Pending LOP Deductions (This Month)</p>
                        </div>
                    </div>`;

c = c.replace(stateBlock, newStateBlock);
c = c.replace(fetchBlock, newFetchBlock);
c = c.replace(gridBlock, newGridBlock);

fs.writeFileSync(p, c);
console.log("Linked FacultyLeaves to Payroll via Pending LOP deductions");
