import re

file_path = "/Users/JSM/Developer/VALOR./WEBSITE REBUILDS/PRUDENTIA COLLEGE OF LAW WEBSITE & ERP/Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx"

with open(file_path, "r") as f:
    content = f.read()

# Fix CSS for the Select dropdowns to remove rogue styling and add autoComplete off
content = re.sub(
    r'<select \s*className="bg-black/5 dark:bg-themePanel backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl px-4 py-3\.5 text-sm font-bold text-themeText dark:text-white outline-none focus:ring-0 focus:border-amber-500 dark:focus:border-amber-500 transition-colors appearance-none"',
    r'<select autoComplete="off" className="!bg-transparent backdrop-blur-xl border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-bold text-themeText outline-none focus:ring-0 focus:border-amber-500 transition-colors appearance-none"',
    content
)

with open(file_path, "w") as f:
    f.write(content)
print("Updated FacultyAssignments.jsx")
