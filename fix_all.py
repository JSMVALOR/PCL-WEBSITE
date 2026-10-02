import re

# Fix AdminNotices
with open('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', 'r') as f:
    notices = f.read()

# Replace all literal \n strings with real newlines 
# We look for the exact mistake `;\n // ---- WHATSAPP` which has a literal backslash n
notices = notices.replace(';\\n // ---- WHATSAPP', ';\n // ---- WHATSAPP')

with open('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', 'w') as f:
    f.write(notices)


# Fix FacultyMarks
with open('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'r') as f:
    marks = f.read()

# The error says "Adjacent JSX elements must be wrapped in an enclosing tag." at line 482
# This happens because the ternary operator `{!isLocked ? (...) : (...)}` is completely broken.
# Let's replace the whole locked UI block with a perfectly valid one.
target_block = """     </button>
     </div>
     )}
     <div className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[13px] font-bold flex items-center gap-2 ml-2">
       <i className="fa-solid fa-lock"></i> Locked
     </div>
     </>
   )}
 </div>"""

replacement_block = """     </button>
     </div>
     )}
     <div className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[13px] font-bold flex items-center gap-2 ml-2">
       <i className="fa-solid fa-lock"></i> Locked
     </div>
     </>
   )}
 </div>"""

# Let's just restore FacultyMarks.jsx from github before my botched script?
