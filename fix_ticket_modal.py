import re

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'r') as f:
    content = f.read()

# Fix the modal container and header
old_modal_start = """                {/* NEW TICKET MODAL */}
                {showTicketModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-transparent w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/20 flex flex-col max-h-[90vh]">
                            
                            <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-5 lg:p-6 text-themeText relative border-b-theme border-black/10 dark:border-white/20 shrink-0">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <h3 className="text-lg lg:text-xl font-semibold tracking-tight tracking-tight mb-1 text-themeText">Create Support Ticket</h3>
                                        <p className={`text-[10px] lg:text-xs ${theme.text.muted} font-medium`}>We usually respond within 24 hours.</p>
                                    </div>
                                    <button type="button" onClick={() => setShowTicketModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border border-black/5 dark:border-white/10 text-themeTextSec hover:text-themeText hover:border-amber-500 transition-colors shrink-0">
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                            </div>"""

new_modal_start = """                {/* NEW TICKET MODAL */}
                {showTicketModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-2xl">
                            
                            <div className="border-b border-black/5 dark:border-white/10 p-6 lg:p-8 shrink-0 flex justify-between items-start relative z-10">
                                <div>
                                    <h3 className="text-xl lg:text-2xl font-black tracking-tight mb-1 text-themeText dark:text-white">Create Support Ticket</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50">We usually respond within 24 hours.</p>
                                </div>
                                <button type="button" onClick={() => setShowTicketModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 border border-themeBorder dark:border-white/10 text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white hover:bg-black/10 transition-colors shrink-0">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>"""
content = content.replace(old_modal_start, new_modal_start)


# Fix the input fields inside the modal
content = content.replace('bg-themePanel border-theme border-themeBorderStrong rounded-[2rem]', 'bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-themeBorder dark:border-white/10 rounded-2xl')
content = content.replace('className={`block text-[9px] lg:text-[13px] font-medium ${theme.text.muted} mb-2 ml-1`}', 'className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2"')
content = content.replace('className={`block text-[9px] lg:text-[13px] font-medium ${theme.text.muted} mb-2 ml-2`}', 'className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2"')

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'w') as f:
    f.write(content)

