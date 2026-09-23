import re

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'r') as f:
    content = f.read()

# Fix the modal container
old_modal_start = """<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setShowTicketModal(false)}></div>
 <div className={`w-full max-w-lg rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh] relative z-10 animate-fade-in border-theme shadow-2xl bg-themePanel`}>
 
 <div className={`p-5 lg:p-6 border-b border-themeBorder flex flex-col gap-6 relative overflow-hidden bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-b border-black/5 dark:border-white/10`}>"""

new_modal_start = """<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setShowTicketModal(false)}></div>
 <div className={`w-full max-w-lg rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh] relative z-10 animate-fade-in bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-2xl`}>
 
 <div className={`p-6 lg:p-8 border-b border-black/5 dark:border-white/10 flex justify-between items-start relative`}>"""

content = content.replace(old_modal_start, new_modal_start)

# Fix close button and title
old_close = """ <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
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

new_close = """ <div>
 <h3 className="text-xl lg:text-2xl font-black tracking-tight text-themeText dark:text-white mb-1">Create Support Ticket</h3>
 <p className={`text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50`}>We usually respond within 24 hours.</p>
 </div>
 <button type="button" onClick={() => setShowTicketModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 border border-themeBorder dark:border-white/10 text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white hover:bg-black/10 transition-colors shrink-0">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>"""

content = content.replace(old_close, new_close)

# Fix input borders inside the form
content = content.replace('bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] px-4 py-3.5 lg:py-4', 'bg-white/50 dark:bg-black/20 border border-themeBorder dark:border-white/10 rounded-2xl px-4 py-3.5 lg:py-4')
content = content.replace('className={`block text-[9px] lg:text-[13px] font-medium ${theme.text.muted} mb-2 ml-1`}', 'className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2"')

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'w') as f:
    f.write(content)

