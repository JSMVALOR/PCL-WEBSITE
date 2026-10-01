const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/AdminPayroll/AdminPayroll.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldLoadConfig = `    useEffect(() => {
        const loadConfig = async () => {
            const { data } = await supabase.from('system_settings').select('value').eq('key', 'payroll_config').maybeSingle();
            if (data?.value) setConfig({ ...config, ...data.value, breakdown: data.value.breakdown || config.breakdown });
        };
        loadConfig();
    }, []);`;

const newLoadConfig = `    useEffect(() => {
        const loadConfig = async () => {
            // Load base payroll config
            const { data: sysData } = await supabase.from('system_settings').select('value').eq('key', 'payroll_config').maybeSingle();
            let newConfig = { ...config };
            if (sysData?.value) {
                newConfig = { ...newConfig, ...sysData.value, breakdown: sysData.value.breakdown || config.breakdown };
            }
            
            // Sync with global leave policies (Casual Leave)
            try {
                const { data: policyData } = await supabase.from('leave_policies').select('annual_limit').eq('name', 'Casual Leave (CL)').maybeSingle();
                if (policyData) {
                    const monthlyLeaves = Math.max(0, Math.floor(policyData.annual_limit / 12));
                    newConfig.allowedPaidLeaves = monthlyLeaves;
                }
            } catch (e) {}

            setConfig(newConfig);
        };
        loadConfig();
    }, []);`;

content = content.replace(oldLoadConfig, newLoadConfig);

const oldAllowedLeavesUI = `                            <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-2">Allowed Paid Leaves / Month</label>
                            <input 
                                type="number" 
                                value={config.allowedPaidLeaves}
                                onChange={(e) => updateConfig({...config, allowedPaidLeaves: Number(e.target.value)})}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500 transition-colors"
                            />`;

const newAllowedLeavesUI = `                            <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-2">Allowed Paid Leaves / Month</label>
                            <div className="w-full flex items-center justify-between bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3">
                                <span className="text-sm font-bold text-themeText dark:text-white">{config.allowedPaidLeaves}</span>
                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"><i className="fa-solid fa-link"></i> Synced to Leave Policy</span>
                            </div>`;

content = content.replace(oldAllowedLeavesUI, newAllowedLeavesUI);

fs.writeFileSync(file, content);
