import re
path = 'src/ERP/components/Admin/AdminFees/AdminFees.jsx'
with open(path, 'r') as f:
    c = f.read()

import_stmt = "import FeeReceiptTemplate from '../../DocumentTemplates/FeeReceiptTemplate';\n"
if "FeeReceiptTemplate" not in c:
    c = c.replace("import { useERP }", import_stmt + "import { useERP }")

injection = """
            {/* Hidden Document Templates for PDF Generation */}
            <div className="hidden">
                <FeeReceiptTemplate ref={luxuryInvoiceRef} invoiceData={currentTxnPayload} studentData={currentTxnPayload?.profiles} />
            </div>
        </div>
    );
}"""

c = re.sub(r"</div>\n\s*\);\n\}", injection, c)

with open(path, 'w') as f:
    f.write(c)
