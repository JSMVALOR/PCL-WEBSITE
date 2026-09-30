const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/AdminPayroll/AdminPayroll.jsx';
let content = fs.readFileSync(file, 'utf8');

// The grid starts here:
const searchString = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">`;

// I will find the starting index of the grid.
const startIndex = content.indexOf(searchString);

// I will find where the grid ends:
const endString = `                        </div>
                    )}
                </div>
            </div>

            {/* PAYMENT & TAX QUESTIONNAIRE MODAL */}`;
const endIndex = content.indexOf(endString) + `                        </div>`.length;

const gridBlock = content.substring(startIndex, endIndex);

const myListView = `
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
                                                    <span className="text-xs font-bold text-themeTextSec dark:text-white/50 line-through">₹{formatCurrency(f.basePay)}</span>
                                                    <span className="text-sm font-black text-amber-500 font-mono">₹{formatCurrency(f.netPay)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenPayment(f)}
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
                                                                <span className="text-themeText dark:text-white font-mono">₹{Math.round(f.basePay * (item.percentage / 100))}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-xl p-4">
                                                        <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-2">Account Details</span>
                                                        <div className="flex flex-col gap-1 text-[10px] font-bold">
                                                            <div className="flex justify-between"><span className="text-themeTextSec dark:text-white/50">Bank:</span> <span className="text-themeText dark:text-white">{f.bankDetails?.bankName || 'N/A'}</span></div>
                                                            <div className="flex justify-between"><span className="text-themeTextSec dark:text-white/50">Acct:</span> <span className="text-themeText dark:text-white">{f.bankDetails?.accountNo || 'N/A'}</span></div>
                                                            <div className="flex justify-between"><span className="text-themeTextSec dark:text-white/50">IFSC:</span> <span className="text-themeText dark:text-white">{f.bankDetails?.ifsc || 'N/A'}</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
`;

const wrappedBlock = `
                        <>
                            {viewMode === 'grid' ? (
                                ${gridBlock}
                            ) : (
                                ${myListView}
                            )}
                        </>
`;

content = content.replace(gridBlock, wrappedBlock);
fs.writeFileSync(file, content);
