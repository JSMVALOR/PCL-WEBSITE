import os
import re

files_to_patch = [
    'src/ERP/components/shared/TopNav.jsx',
    'src/ERP/components/shared/IntelligentBot.jsx',
    'src/ERP/components/shared/QuestionnaireModal.jsx',
    'src/Website/components/NAVBAR/ABOUT/FacultyCard.jsx',
    'src/Website/components/HOME/ADVANTAGES/Advantages.jsx',
    'src/ERP/components/Faculty/FacultyDashboard/FacultySyllabusProgression.jsx',
    'src/ERP/components/Admin/AdminDashboard/AdminCampusPulse.jsx',
    'src/ERP/components/Student/StudentDashboard/StudentTrajectoryChart.jsx',
    'src/ERP/components/Faculty/FacultyDashboard/FacultyCourseHealth.jsx',
]

replacements = [
    (r'text-\[#1C1C1E\] dark:text-\[#F2F2F7\]', 'text-themeText'),
    (r'text-\[#3A3A3C\] dark:text-\[#EBEBF5\]/60', 'text-themeTextSec'),
    (r'text-\[#3A3A3C\] dark:text-\[#EBEBF5\]/80', 'text-themeTextSec'),
    (r'text-\[#1C1C1E\]', 'text-themeText'),
    (r'text-\[#007AFF\]', 'text-themeAccent'),
    (r'bg-\[#007AFF\]/10', 'bg-themeAccent/10'),
    (r'border-\[#007AFF\]/20', 'border-themeAccent/20'),
    (r'border-\[#007AFF\]/30', 'border-themeAccent/30'),
    (r'bg-black/5 dark:bg-white/10', 'bg-themeElevated'),
    (r'hover:bg-black/10 dark:hover:bg-white/20', 'hover:bg-themeElevated/80'),
    (r'hover:text-\[#1C1C1E\] dark:hover:text-\[#F2F2F7\]', 'hover:text-themeText'),
    (r'hover:text-\[#1C1C1E\]', 'hover:text-themeText'),
    (r'text-\[#FF3B30\]', 'text-rose-500'),
    (r'bg-\[#FF3B30\]/10', 'bg-rose-500/10'),
    (r'border-\[#FF3B30\]/20', 'border-rose-500/20'),
    (r'text-\[#8E8E93\]', 'text-themeTextSec'),
    (r'bg-\[#1e1e1e\]/95', 'bg-black/95 dark:bg-white/5'),
    (r'group-hover:text-\[#000\]', 'group-hover:text-black dark:group-hover:text-white'),
    (r'dark:bg-\[#1C1C1E\]/70', 'dark:bg-themePanel/70'),
    (r'text-\[#EBEBF5\]/50', 'text-themeTextSec'),
    (r"color:\s*'\#34C759'", "color: 'var(--theme-accent)'"),
    (r"color:\s*'\#007AFF'", "color: 'var(--theme-accent)'"),
    (r"backgroundColor:\s*'rgba\(28, 28, 30, 0.8\)'", "backgroundColor: 'var(--theme-panel)'"),
    (r"color:\s*'\#fff'", "color: 'var(--theme-text)'")
]

for filepath in files_to_patch:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath}, does not exist")
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    for old, new in replacements:
        content = re.sub(old, new, content)
        
    with open(filepath, 'w') as f:
        f.write(content)

print("Theme purge complete.")
