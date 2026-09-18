import os

files_to_fix = [
    'src/ERP/components/Admin/AdminPayroll/AdminPayroll.jsx',
    'src/ERP/components/Admin/AdminFees/AdminFees.jsx',
    'src/ERP/components/Student/Credentials/Credentials.jsx',
    'src/ERP/components/Student/Fees/Fees.jsx',
    'src/ERP/components/Faculty/FacultyPayroll/FacultyPayroll.jsx'
]

for path in files_to_fix:
    if os.path.exists(path):
        with open(path, 'r') as f:
            c = f.read()
        
        # Replace 2-level deep imports with 3-level deep imports
        c = c.replace("../../DocumentTemplates", "../../../DocumentTemplates")
        
        with open(path, 'w') as f:
            f.write(c)

