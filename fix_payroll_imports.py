import re
path = 'src/ERP/components/Admin/AdminPayroll/AdminPayroll.jsx'
with open(path, 'r') as f:
    c = f.read()
c = c.replace("import LuxuryPayslipTemplate from './LuxuryPayslipTemplate';", "import LuxuryPayslipTemplate from '../../DocumentTemplates/LuxuryPayslipTemplate';")
with open(path, 'w') as f:
    f.write(c)
