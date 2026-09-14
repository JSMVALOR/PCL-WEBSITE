import re

with open('src/ERP/components/Login/Login.jsx', 'r') as f:
    text = f.read()

import_stmt = "import ValorLogo from '../shared/ValorLogo';\n"
text = text.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\n" + import_stmt)

# Find the footer section
old_footer = """<span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-color)]/70">
                    Powered by JSM VALOR
                </span>"""

new_footer = """<div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-color)]/50">
                        POWERED BY
                    </span>
                    <ValorLogo className="scale-75 origin-left" />
                </div>"""

text = text.replace(old_footer, new_footer)

with open('src/ERP/components/Login/Login.jsx', 'w') as f:
    f.write(text)

