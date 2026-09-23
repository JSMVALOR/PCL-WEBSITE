import re
with open('src/Website/components/UI/Preloader/Preloader.jsx', 'r') as f:
    content = f.read()

content = content.replace("const DISPLAY_DURATION = 2500;", "const DISPLAY_DURATION = 800;")

with open('src/Website/components/UI/Preloader/Preloader.jsx', 'w') as f:
    f.write(content)
