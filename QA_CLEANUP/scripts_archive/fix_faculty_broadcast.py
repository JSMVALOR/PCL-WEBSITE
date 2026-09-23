import re

with open('src/ERP/components/Student/Notices/FacultyBroadcastForm.jsx', 'r') as f:
    content = f.read()

# 1. Fix the payload error (remove requires_acknowledgement)
payload_old = """ const { error } = await supabase.from('notices').insert([{
 title,
 content,
 category,
 priority,
 target_audience: targetAudience,
 requires_acknowledgement: requiresAck,
 author_id: userSession?.db_id
 }]);"""

payload_new = """ const { error } = await supabase.from('notices').insert([{
 title,
 content,
 category,
 priority,
 target_audience: targetAudience,
 // requires_acknowledgement: requiresAck, // Removed: Column missing in schema
 author_id: userSession?.db_id
 }]);"""
content = content.replace(payload_old, payload_new)

# 2. Upgrade the UI Header
header_old = """ <div className="p-4 md:p-6 lg:p-8 border-b border-black/10 dark:border-white/20 flex justify-between items-center bg-transparent/20">
 <div>
 <h2 className="text-2xl font-semibold tracking-tight text-themeText tracking-tight">{userSession?.role === "admin" ? "Administrative Broadcast" : "Faculty Broadcast"}</h2>
 <p className="text-xs font-bold text-themeTextSec mt-1">Send official notices directly to your assigned batches or specific students.</p>
 </div>
 <button type="button" onClick={onCancel} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border border-black/5 dark:border-white/10 text-themeTextSec hover:text-rose-500 hover:border-rose-500/30 transition">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>"""

header_new = """ <div className="p-6 lg:p-8 border-b border-black/5 dark:border-white/10 flex justify-between items-start bg-white/50 dark:bg-black/10 backdrop-blur-xl relative z-10 shrink-0">
 <div>
 <h2 className="text-xl lg:text-2xl font-black tracking-tight text-themeText dark:text-white mb-1">{userSession?.role === "admin" ? "Administrative Broadcast" : "Faculty Broadcast"}</h2>
 <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50">Send official notices directly to assigned batches or students.</p>
 </div>
 <button type="button" onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 border border-themeBorder dark:border-white/10 text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white hover:bg-black/10 transition-colors shrink-0">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>"""
content = content.replace(header_old, header_new)

# 3. Upgrade input styles
input_old = 'className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none"'
input_new = 'className="w-full bg-gray-100 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-blue-500 outline-none transition"'

content = content.replace(input_old, input_new)
content = content.replace(
    'className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none appearance-none"',
    'className="w-full bg-gray-100 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-blue-500 outline-none appearance-none transition"'
)
content = content.replace(
    'className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none resize-none"',
    'className="w-full bg-gray-100 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm font-medium text-themeText dark:text-white focus:border-blue-500 outline-none resize-none transition shadow-inner"'
)

# 4. Fix labels
content = content.replace('className="text-[13px] font-medium text-themeTextSec mb-2 block"', 'className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2"')

# 5. Fix Checkbox
checkbox_old = """ <label className="flex items-center gap-3 p-4 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border border-black/5 dark:border-white/10 rounded-xl cursor-pointer hover:border-themeAccent/50 transition-colors">
 <input type="checkbox" checked={requiresAck} onChange={e => setRequiresAck(e.target.checked)} className="accent-themeAccent w-4 h-4" />
 <div>
 <span className="text-sm font-bold text-themeText block">Require Digital Acknowledgement</span>
 <span className="text-[10px] font-bold text-themeTextSec">Force students to sign that they have read this notice.</span>
 </div>
 </label>"""

checkbox_new = """ <label className="flex items-center gap-4 p-5 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-2xl cursor-pointer hover:border-blue-500/40 transition-colors">
 <input type="checkbox" checked={requiresAck} onChange={e => setRequiresAck(e.target.checked)} className="w-5 h-5 accent-blue-500 rounded border-black/10" />
 <div>
 <span className="text-sm font-black tracking-tight text-themeText dark:text-white block mb-0.5">Require Digital Acknowledgement</span>
 <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500/70">Forces students to sign upon reading. (Feature flagged)</span>
 </div>
 </label>"""
content = content.replace(checkbox_old, checkbox_new)

# 6. Fix Actions Wrapper & Submit Button
action_old = """ <div className="p-6 border-t border-black/10 dark:border-white/20 bg-transparent/50 flex justify-end gap-4 shrink-0">
 <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl text-[14px] font-medium tracking-normal text-themeText transition hover:bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20">
 Cancel
 </button>
 <button type="submit" form="faculty-broadcast-form" disabled={isPublishing} className="px-8 py-3 bg-themeAccent hover:opacity-90 text-themeApp rounded-xl text-[14px] font-medium tracking-normal transition-opacity flex items-center gap-2">
 {isPublishing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
 {isPublishing ? 'Broadcasting...' : 'Broadcast Notice'}
 </button>
 </div>"""

action_new = """ <div className="p-6 lg:p-8 border-t border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/10 backdrop-blur-xl flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
 <button type="button" onClick={onCancel} className="px-6 py-3.5 rounded-xl text-sm font-bold text-themeTextSec dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-themeText dark:hover:text-white transition">
 Cancel
 </button>
 <button type="submit" form="faculty-broadcast-form" disabled={isPublishing} className="px-8 py-3.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white shadow-xl shadow-blue-500/20 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
 {isPublishing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
 {isPublishing ? 'Broadcasting...' : 'Broadcast Notice'}
 </button>
 </div>"""
content = content.replace(action_old, action_new)

# Main modal background upgrade
content = content.replace('bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] rounded-2xl', 'bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-[2rem] shadow-2xl')

with open('src/ERP/components/Student/Notices/FacultyBroadcastForm.jsx', 'w') as f:
    f.write(content)

