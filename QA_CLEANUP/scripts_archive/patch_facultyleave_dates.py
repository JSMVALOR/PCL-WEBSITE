import re
with open('src/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx', 'r') as f:
    content = f.read()

# Add today variable
if "const today =" not in content:
    content = content.replace(
        'const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });',
        'const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });\n    const today = new Date().toISOString().split("T")[0];'
    )

# Fix fromDate input
content = re.sub(
    r'<input type="date" min="2024-01-01" max="2026-12-31"(.*?value=\{fromDate\}.*?)>',
    r'<input type="date" min={today} max="2026-12-31"\1>',
    content
)

# Fix toDate input
content = re.sub(
    r'<input type="date" max="2026-12-31"(.*?value=\{toDate\}.*?)min=\{fromDate\}',
    r'<input type="date" max="2026-12-31"\1min={fromDate || today}',
    content
)

with open('src/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx', 'w') as f:
    f.write(content)
