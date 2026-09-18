import re
path = 'src/ERP/components/Student/Fees/Fees.jsx'
with open(path, 'r') as f:
    c = f.read()

import_stmt = "import FeeReceiptTemplate from '../../../DocumentTemplates/FeeReceiptTemplate';\n"
if "FeeReceiptTemplate" not in c:
    c = c.replace("import { useERP }", import_stmt + "import { useERP }")

injection = """
            {/* Hidden Document Templates for PDF Generation */}
            <div className="hidden">
                <FeeReceiptTemplate ref={invoiceRef} invoiceData={selectedInvoice} studentData={userSession} />
            </div>
        </div>
    );
}"""

c = re.sub(r"</div>\s*<ToastContainer[^>]*/>\s*</div>\s*\);\s*\}", 
           "</div>\n<ToastContainer />\n" + injection, c)

with open(path, 'w') as f:
    f.write(c)
