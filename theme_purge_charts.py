import os
import re

files_to_patch = [
    'src/ERP/components/shared/DashboardWidgets/StudentTrajectoryChart.jsx',
    'src/ERP/components/shared/DashboardWidgets/FacultyCourseHealth.jsx',
    'src/ERP/components/shared/DashboardWidgets/AdminCampusPulse.jsx',
]

replacements = [
    (r"backgroundColor:\s*'rgba\(28, 28, 30, 0\.8\)'", "backgroundColor: 'var(--theme-panel)'"),
    (r"color:\s*'\#fff'", "color: 'var(--theme-text)'"),
    (r"color:\s*'\#34C759'", "color: 'var(--theme-accent)'"),
    (r"color:\s*'\#007AFF'", "color: 'var(--theme-accent)'")
]

for filepath in files_to_patch:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath}")
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = re.sub(old, new, content)
    with open(filepath, 'w') as f:
        f.write(content)

print("Charts theme purge complete.")
