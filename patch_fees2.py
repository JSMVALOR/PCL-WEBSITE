import re
path = 'src/ERP/components/Student/Fees/Fees.jsx'
with open(path, 'r') as f:
    c = f.read()

injection = """
            {/* Hidden Document Templates for PDF Generation */}
            <div className="hidden">
                <FeeReceiptTemplate ref={invoiceRef} invoiceData={selectedInvoice} studentData={userSession} />
            </div>
        </div>
    );
}"""

c = re.sub(r"</div>\n\s*\);\n\}", injection, c)

with open(path, 'w') as f:
    f.write(c)
