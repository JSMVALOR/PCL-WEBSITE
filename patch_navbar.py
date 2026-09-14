with open('src/Website/components/NAVBAR/Navbar.jsx', 'r') as f:
    text = f.read()

# Add onClick={() => setActiveDropdown(null)} to Contact link
old_contact_link = """<Link to="/contact" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--bg-color)] bg-[var(--primary-color)] px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-[var(--primary-color)]/20">"""
new_contact_link = """<Link to="/contact" onClick={() => setActiveDropdown(null)} className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--bg-color)] bg-[var(--primary-color)] px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-[var(--primary-color)]/20">"""
text = text.replace(old_contact_link, new_contact_link)

# Add onClick={() => setActiveDropdown(null)} to subItems
old_subitem_link = """                                        <Link
                                          key={sIdx}
                                          to={subItem.link}"""
new_subitem_link = """                                        <Link
                                          key={sIdx}
                                          to={subItem.link}
                                          onClick={() => setActiveDropdown(null)}"""
text = text.replace(old_subitem_link, new_subitem_link)

with open('src/Website/components/NAVBAR/Navbar.jsx', 'w') as f:
    f.write(text)

