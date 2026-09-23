import glob

files = [
    "src/ERP/components/Faculty/FacultyMentorship/FacultyStudentProfile360.jsx",
    "src/ERP/components/Faculty/Approvals/Approvals.jsx",
    "src/ERP/components/Student/Credentials/ProfileEditModal.jsx",
    "src/ERP/components/Admin/AdminSiteEditor/AdminSiteEditor.jsx",
    "src/ERP/components/Admin/AdminLegalAid/AdminLegalAid.jsx",
    "src/ERP/components/Admin/LeaveManagement/LeaveReview.jsx",
    "src/ERP/components/Admin/BlogManager/BlogManager.jsx",
    "src/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx"
]

import_statement = "import SlideCommit from '../../../../Shared/components/ReactBits/SlideCommit/SlideCommit';"

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    if "import SlideCommit" not in content:
        # Determine how many levels up depending on directory depth
        # Or just use an absolute alias if possible, but let's just do it manually based on depth
        
        depth = filepath.count('/') - 1
        prefix = '../' * depth
        # wait, it's easier to just calculate it
        # e.g. src/ERP/components/Faculty/Approvals/Approvals.jsx has 5 slashes.
        # It is inside src (0)/ERP (1)/components (2)/Faculty (3)/Approvals (4)
        # So back to src is ../../../../
        
        relative = "../" * depth + "Shared/components/ReactBits/SlideCommit/SlideCommit"
        stmt = f"import SlideCommit from '{relative}';"
        
        content = content.replace("import React", stmt + "\nimport React", 1)
        
        with open(filepath, 'w') as f:
            f.write(content)

