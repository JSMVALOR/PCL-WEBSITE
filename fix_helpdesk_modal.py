import re

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'r') as f:
    content = f.read()

# 1. Replace the header container and circle
pattern_header = r'<div className="bg-black/5 dark:bg-white/10 backdrop-blur-\[80px\].*?</div>\s*</div>\s*</div>'
new_header = """<div className="bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border-b border-black/5 dark:border-white/10 p-6 lg:p-8 shrink-0 flex justify-between items-start relative z-10">
    <div>
        <h3 className="text-xl font-black tracking-tight mb-1 text-themeText dark:text-white">Create Support Ticket</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50">We usually respond within 24 hours.</p>
    </div>
    <button type="button" onClick={() => setShowTicketModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 border border-themeBorder dark:border-white/10 text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white hover:bg-black/10 transition-colors shrink-0">
        <i className="fa-solid fa-xmark"></i>
    </button>
</div>"""
content = re.sub(pattern_header, new_header, content, flags=re.DOTALL)

# 2. Fix the Select input styling
pattern_select = r'<select\s*value=\{ticketForm\.category\}.*?className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-\[2rem\].*?".*?>'
new_select = r'<select value={ticketForm.category} onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })} className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition appearance-none cursor-pointer" required>'
content = re.sub(pattern_select, new_select, content, flags=re.DOTALL)

# 3. Fix the Textarea input styling
pattern_textarea = r'<textarea\s*rows="4"\s*value=\{ticketForm\.description\}.*?className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-\[2rem\].*?".*?>'
new_textarea = r'<textarea rows="4" value={ticketForm.description} onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })} className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-medium text-themeText dark:text-white focus:border-amber-500 outline-none transition resize-none placeholder:text-themeTextSec dark:text-white/30" placeholder="Please describe your issue in detail..." required>'
content = re.sub(pattern_textarea, new_textarea, content, flags=re.DOTALL)

# 4. Fix labels
content = content.replace('className={`block text-[9px] lg:text-[13px] font-medium ${theme.text.muted} mb-2 ml-1`}', 'className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2"')
content = content.replace('className={`block text-[9px] lg:text-[13px] font-medium ${theme.text.muted} mb-2 ml-2`}', 'className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2"')

# 5. Fix submit button
content = content.replace('className={`w-full py-3.5 lg:py-4 rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 flex justify-center items-center gap-2 ${isSubmitting || !ticketForm.category || !ticketForm.description', 'className={`w-full py-3.5 rounded-xl text-sm font-black transition duration-300 flex justify-center items-center gap-2 ${isSubmitting || !ticketForm.category || !ticketForm.description')

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'w') as f:
    f.write(content)

