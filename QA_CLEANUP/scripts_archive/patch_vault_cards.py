import re

with open('src/ERP/components/Student/CourseVault/CourseVault.jsx', 'r') as f:
    content = f.read()

# 1. Add state for the materials modal
if 'const [activeMaterialsSubject, setActiveMaterialsSubject] = useState(null);' not in content:
    content = content.replace(
        'const [previewUrl, setPreviewUrl] = useState(null);',
        'const [previewUrl, setPreviewUrl] = useState(null);\n    const [activeMaterialsSubject, setActiveMaterialsSubject] = useState(null);'
    )

# 2. Modify the Card rendering
# We need to replace the entire <div className="p-4 flex-1 flex flex-col">...</div>
# with a simple button container.
old_card_body = r'<div className="p-4 flex-1 flex flex-col">.*?</div>\s*</div>\s*\);\s*\}\)\s*\)\}'
# Wait, regexing over that block might be tricky due to nested divs. Let's find exactly the block to replace.
