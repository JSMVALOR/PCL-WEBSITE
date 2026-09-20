import re

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'r') as f:
    content = f.read()

old_ui = """                <div className="flex flex-col gap-6 animate-fade-in w-full max-w-4xl mt-2">
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 lg:p-8 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-rose-500 mb-2">
                            <i className="fa-solid fa-shield-halved text-3xl"></i>
                            <h3 className="text-2xl font-black tracking-tight">Anonymous Grievance Cell</h3>
                        </div>
                        <p className="text-sm font-medium text-themeTextSec leading-relaxed">
                            Report critical issues such as ragging, harassment, or other serious violations. Your submission is 100% anonymous and goes directly to the Central Approvals Command Center.
                        </p>
                        
                        <form onSubmit={handleGrievanceSubmit} className="flex flex-col gap-4 mt-4">
                            {grievanceStatus.text && (
                                <div className={`p-4 rounded-xl text-xs font-bold ${grievanceStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                    {grievanceStatus.text}
                                </div>
                            )}
                            <textarea
                                rows="5"
                                value={grievanceForm.description}
                                onChange={(e) => setGrievanceForm({ ...grievanceForm, description: e.target.value })}
                                placeholder="Describe the incident securely..."
                                className="w-full bg-black/5 dark:bg-white/5 border border-rose-500/20 rounded-2xl px-5 py-4 text-sm font-medium text-themeText focus:border-rose-500 outline-none transition resize-none placeholder:text-rose-500/50"
                                required
                            ></textarea>
                            <button type="submit" disabled={isSubmitting} className="bg-rose-500 hover:bg-rose-600 text-white font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-2xl transition w-fit flex items-center gap-2 mt-2">
                                {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                                Submit Securely
                            </button>
                        </form>
                    </div>
                </div>"""

new_ui = """                <div className="flex flex-col gap-6 animate-fade-in w-full max-w-4xl mt-4">
                    <div className="bg-themePanel border border-rose-500/20 shadow-2xl shadow-rose-500/10 rounded-[2.5rem] p-6 lg:p-10 flex flex-col gap-6 relative overflow-hidden">
                        
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>

                        <div className="flex items-center gap-4 text-rose-500 mb-2 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                <i className="fa-solid fa-user-secret text-2xl"></i>
                            </div>
                            <div>
                                <h3 className="text-2xl lg:text-3xl font-black tracking-tight text-themeText dark:text-white leading-tight">Anonymous Grievance</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-1">100% Secure & Untraceable</p>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-themeTextSec leading-relaxed relative z-10">
                            Report critical issues such as ragging, harassment, or other serious violations. Your submission is completely anonymous, stripped of session tokens, and goes directly to the Central Approvals Command Center.
                        </p>
                        
                        <form onSubmit={handleGrievanceSubmit} className="flex flex-col gap-5 mt-2 relative z-10">
                            {grievanceStatus.text && (
                                <div className={`p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${grievanceStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                    <i className={`fa-solid ${grievanceStatus.type === 'success' ? 'fa-check' : 'fa-triangle-exclamation'}`}></i> {grievanceStatus.text}
                                </div>
                            )}
                            <div className="relative">
                                <textarea
                                    rows="6"
                                    value={grievanceForm.description}
                                    onChange={(e) => setGrievanceForm({ ...grievanceForm, description: e.target.value })}
                                    placeholder="Describe the incident with as much detail as possible..."
                                    className="w-full bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-themeBorder dark:border-white/10 rounded-3xl px-6 py-5 text-sm font-medium text-themeText dark:text-white focus:border-rose-500 focus:bg-white dark:focus:bg-[#121212] outline-none transition-all resize-none placeholder:text-themeTextSec dark:placeholder:text-white/30 shadow-inner"
                                    required
                                ></textarea>
                                <div className="absolute bottom-5 right-6 pointer-events-none">
                                    <i className="fa-solid fa-lock text-themeTextSec dark:text-white/20"></i>
                                </div>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="bg-rose-500 hover:bg-rose-400 text-white shadow-xl shadow-rose-500/20 font-black uppercase tracking-widest text-xs lg:text-sm px-8 py-4 rounded-[2rem] transition-all w-full lg:w-fit flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin text-lg"></i> : <i className="fa-solid fa-paper-plane text-lg"></i>}
                                Transmit Securely
                            </button>
                        </form>
                    </div>
                </div>"""

content = content.replace(old_ui, new_ui)

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'w') as f:
    f.write(content)

