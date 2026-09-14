import re

with open('src/ERP/ErpApp.jsx', 'r') as f:
    text = f.read()

import_stmt = "import ValorLogo from './components/shared/ValorLogo';\n"
text = text.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\n" + import_stmt)

old_footer = """                  &copy; {new Date().getFullYear()} JSM VALOR. Data Processor.
                </div>"""

new_footer = """                  <div className="flex items-center gap-2">
                    <span className="opacity-50">&copy; {new Date().getFullYear()}</span>
                    <ValorLogo className="scale-[0.5] origin-left -ml-1 -mr-6" />
                    <span className="opacity-50">Data Processor.</span>
                  </div>
                </div>"""

text = text.replace(old_footer, new_footer)

with open('src/ERP/ErpApp.jsx', 'w') as f:
    f.write(text)

