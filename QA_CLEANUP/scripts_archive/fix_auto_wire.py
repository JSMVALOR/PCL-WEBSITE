import re

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

# Replace the auto-wire useEffect to just return immediately
new_wire = """
    useEffect(() => {
        // Disabled: Auto-wiring should only be done by Admins or via database migrations.
        const wireDataset = async () => {
            return;
"""
content = re.sub(r'useEffect\(\(\) => \{\n\s*const wireDataset = async \(\) => \{\n\s*if \(localStorage\.getItem\(\'wired_dataset_aug_17_v2\'\)\) return;', new_wire, content)

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)
