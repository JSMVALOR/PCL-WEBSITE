const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/AdminPayroll/AdminPayroll.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add getAvatarUrl import
content = content.replace(
    /import QRCode from 'react-qr-code';/,
    "import QRCode from 'react-qr-code';\nimport { getAvatarUrl } from '../../../utils/avatarUtils';"
);

// 2. Add viewMode state
content = content.replace(
    /const \[expandedCards, setExpandedCards\] = useState\(\[\]\);/,
    "const [expandedCards, setExpandedCards] = useState([]);\n    const [viewMode, setViewMode] = useState('grid');"
);

// 3. Fix Avatar and add View Mode Toggle
const oldHeader = `<div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-themeText dark:text-white tracking-tight">Faculty Payroll Cards</h2>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            Current Month
                        </span>
                    </div>`;

const newHeader = `<div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-black text-themeText dark:text-white tracking-tight">Faculty Payroll</h2>
                            <span className="inline-block mt-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                Current Month
                            </span>
                        </div>
                        <div className="flex bg-black/5 dark:bg-white/5 rounded-xl p-1 border border-black/10 dark:border-white/10">
                            <button onClick={() => setViewMode('grid')} className={\`px-4 py-2 rounded-lg text-xs font-black transition-all \${viewMode === 'grid' ? 'bg-white dark:bg-themeElevated shadow-sm text-themeText' : 'text-themeTextSec hover:text-themeText dark:text-white/50 dark:hover:text-white'}\`}>
                                <i className="fa-solid fa-border-all"></i> Grid
                            </button>
                            <button onClick={() => setViewMode('list')} className={\`px-4 py-2 rounded-lg text-xs font-black transition-all \${viewMode === 'list' ? 'bg-white dark:bg-themeElevated shadow-sm text-themeText' : 'text-themeTextSec hover:text-themeText dark:text-white/50 dark:hover:text-white'}\`}>
                                <i className="fa-solid fa-list"></i> List
                            </button>
                        </div>
                    </div>`;

content = content.replace(oldHeader, newHeader);

// 4. Update the Grid/List render
const oldGridRegex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?Process Payment\s*<\/button>\s*<\/div>\s*<\/div>\s*\)\)}\s*<\/div>/;

const newGridAndList = `
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {faculty.map(f => (
                                        <div key={f.id} className="bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group">
                                            {f.isProcessed && (
                                                <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                    Paid
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-4">
                                                <img src={getAvatarUrl({ name: f.full_name, avatar_url: f.profile_picture_url })} alt={f.full_name} onError={(e) => { e.target.onerror = null; e.target.src = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(f.full_name)}&background=random&color=fff&rounded=true&bold=true\`; }} className="w-12 h-12 rounded-full object-cover border border-themeBorder dark:border-white/10 shadow-sm" />
                                                <div>
                                                    <h4 className="text-base font-black text-themeText dark:text-white">{f.full_name}</h4>
                                                    <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">{f.erp_id}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] rounded-xl p-4 border border-black/[0.04] dark:border-white/[0.08]">
                                                <div className="flex flex-col mb-3">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">Gross Base Salary (Editable)</span>
                                                            <button aria-label={expandedCards.includes(f.id) ? "Collapse breakdown" : "Expand breakdown"} onClick={() => toggleCardBreakdown(f.id)} className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-themeTextSec dark:text-white/40 hover:text-themeText dark:text-white transition-colors">
                                                                <i className={\`fa-solid fa-chevron-down text-[8px] transition-transform \${expandedCards.includes(f.id) ? 'rotate-180' : ''}\`}></i>
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-1 font-mono text-themeText dark:text-white font-black text-sm">
                                                            <span className="text-themeTextSec dark:text-white/30 font-sans">₹</span>
                                                            <input 
                                                                type="number" 
                                                                value={customBasePays[f.id] !== undefined ? customBasePays[f.id] : (f.base_salary || config.defaultBasePay)} 
                                                                onChange={(e) => setCustomBasePays({...customBasePays, [f.id]: e.target.value})}
                                                                className="w-16 bg-transparent text-right outline-none focus:border-b border-themeText dark:border-white"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {expandedCards.includes(f.id) && (
                                                    <div className="mb-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-col gap-2 animate-fade-in">
                                                        {f.salary_structure?.map((item, i) => (
                                                            <div key={i} className="flex justify-between text-[10px] font-bold">
                                                                <span className="text-themeTextSec dark:text-white/50 uppercase tracking-widest">{item.name} ({item.percentage}%)</span>
                                                                <span className="text-themeText dark:text-white font-mono">₹{Math.round((customBasePays[f.id] || f.base_salary || config.defaultBasePay) * (item.percentage / 100))}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">Preferred Account</span>
                                                    <span className="text-xs font-bold text-themeText dark:text-white truncate max-w-[120px]">{f.bankDetails.bankName} (..{f.bankDetails.accountNo.slice(-4)})</span>
                                                </div>
                                                <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                                    <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">Leaves (Total/LOP)</span>
                                                    <span className={\`text-xs font-black \${f.lopDays > 0 ? 'text-rose-500' : 'text-themeText dark:text-white'}\`}>
                                                        {f.totalLeaveDays} / {f.lopDays} LOP
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center mt-4">
                                                    <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">PRE-TAX NET PAY</span>
                                                    <span className="text-base font-black text-amber-500 font-mono">₹{formatCurrency(f.netPay)}</span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center mt-3">
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Annual CTC</span>
                                                    <span className="text-xs font-black text-emerald-500 font-mono">₹{formatCurrency((customBasePays[f.id] || f.base_salary || config.defaultBasePay) * 12)}</span>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => openPaymentModal(f)}
                                                disabled={f.isProcessed}
                                                className="w-full py-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-themeText dark:text-white text-xs font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-black/[0.04] dark:border-white/[0.08]"
                                            >
                                                {f.isProcessed ? 'Processed' : 'Process Payment'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {faculty.map(f => (
                                        <div key={f.id} className="bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-black/10 dark:hover:bg-white/5">
                                            
                                            <div className="flex items-center gap-4 flex-1">
                                                <img src={getAvatarUrl({ name: f.full_name, avatar_url: f.profile_picture_url })} alt={f.full_name} onError={(e) => { e.target.onerror = null; e.target.src = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(f.full_name)}&background=random&color=fff&rounded=true&bold=true\`; }} className="w-10 h-10 rounded-full object-cover border border-themeBorder dark:border-white/10 shadow-sm" />
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-black text-themeText dark:text-white">{f.full_name}</h4>
                                                        {f.isProcessed && <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Paid</span>}
                                                    </div>
                                                    <p className="text-[9px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">{f.erp_id} • {f.totalLeaveDays} LVS / {f.lopDays} LOP</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-start md:items-end flex-1">
                                                <span className="text-[9px] font-black text-themeTextSec dark:text-white/40 uppercase tracking-widest">Base / Net Pay</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs font-bold text-themeTextSec dark:text-white/50 line-through">₹{formatCurrency(customBasePays[f.id] || f.base_salary || config.defaultBasePay)}</span>
                                                    <span className="text-sm font-black text-amber-500 font-mono">₹{formatCurrency(f.netPay)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => openPaymentModal(f)}
                                                    disabled={f.isProcessed}
                                                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-black/10 dark:disabled:bg-white/10 text-black dark:disabled:text-white/50 rounded-xl text-xs font-black transition-colors disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    {f.isProcessed ? 'Paid' : 'Pay'}
                                                </button>
                                                <button onClick={() => toggleCardBreakdown(f.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-themeTextSec dark:text-white/50 transition-colors">
                                                    <i className={\`fa-solid fa-chevron-down text-xs transition-transform \${expandedCards.includes(f.id) ? 'rotate-180' : ''}\`}></i>
                                                </button>
                                            </div>

                                            {/* Expandable Breakdown in List View */}
                                            {expandedCards.includes(f.id) && (
                                                <div className="w-full basis-full mt-2 pt-4 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row gap-6 animate-fade-in">
                                                    <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-xl p-4">
                                                        <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-2">Salary Structure</span>
                                                        {f.salary_structure?.map((item, i) => (
                                                            <div key={i} className="flex justify-between text-[10px] font-bold py-1">
                                                                <span className="text-themeText dark:text-white/80">{item.name} ({item.percentage}%)</span>
                                                                <span className="text-themeText dark:text-white font-mono">₹{Math.round((customBasePays[f.id] || f.base_salary || config.defaultBasePay) * (item.percentage / 100))}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-xl p-4">
                                                        <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-2">Account Details</span>
                                                        <div className="flex flex-col gap-1 text-[10px] font-bold">
                                                            <div className="flex justify-between"><span className="text-themeTextSec dark:text-white/50">Bank:</span> <span className="text-themeText dark:text-white">{f.bankDetails.bankName}</span></div>
                                                            <div className="flex justify-between"><span className="text-themeTextSec dark:text-white/50">Acct:</span> <span className="text-themeText dark:text-white">{f.bankDetails.accountNo}</span></div>
                                                            <div className="flex justify-between"><span className="text-themeTextSec dark:text-white/50">IFSC:</span> <span className="text-themeText dark:text-white">{f.bankDetails.ifsc}</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
`;
content = content.replace(oldGridRegex, newGridAndList);

fs.writeFileSync(file, content);
