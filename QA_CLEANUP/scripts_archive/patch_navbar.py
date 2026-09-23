import re
with open('src/Website/components/NAVBAR/Navbar.jsx', 'r') as f:
    content = f.read()

# Remove the import NoticeBanner
content = re.sub(r"import NoticeBanner from '\.\./UI/NoticeBanner';\n?", "", content)

# Remove the NoticeBanner block
banner_block = r"""          \{\/\* Top Info Banner - Collapses on scroll \*\/\}
          <div 
            style=\{\{ transition: 'max-height 0\.4s cubic-bezier\(0\.16, 1, 0\.3, 1\), opacity 0\.4s ease', overflow: 'hidden', maxHeight: scrolled || activeDropdown \? '0px' : '100px', opacity: scrolled || activeDropdown \? 0 : 1 \}\}
          >
            <NoticeBanner />
          </div>"""

content = re.sub(banner_block, "", content)

with open('src/Website/components/NAVBAR/Navbar.jsx', 'w') as f:
    f.write(content)
