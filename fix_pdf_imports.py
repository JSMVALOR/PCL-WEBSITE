import os
import re

def fix_imports(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    content = content.replace("from '../../../lib/pdfEngine'", "from '../../DocumentTemplates/pdfEngine'")
    content = content.replace("from \"../../../lib/pdfEngine\"", "from \"../../DocumentTemplates/pdfEngine\"")
    
    content = content.replace("from '../../../lib/NativePayslipEngine'", "from '../../DocumentTemplates/NativePayslipEngine'")
    content = content.replace("from \"../../../lib/NativePayslipEngine\"", "from \"../../DocumentTemplates/NativePayslipEngine\"")

    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk('src/ERP/components'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            fix_imports(os.path.join(root, file))

