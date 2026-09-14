import os

for root, dirs, files in os.walk('src/ERP/components'):
    for name in files:
        if name.endswith('.jsx'):
            filepath = os.path.join(root, name)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                content = content.replace('window.erpDialog?.alert("Feature coming soon!");', 'window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment.");')
                content = content.replace('window.erpDialog?.alert("Feature Coming Soon");', 'window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment.");')
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
            except Exception as e:
                pass

print("Patched ghost links.")
