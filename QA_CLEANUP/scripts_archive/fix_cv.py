import re
with open('src/ERP/components/Student/CourseVault/CourseVault.jsx', 'r') as f:
    content = f.read()

old = """                                        </div>
                                </div>
                            );
                        })"""

new = """                                        </div>
                                    </div>
                                </div>
                            );
                        })"""
if old in content:
    content = content.replace(old, new)

with open('src/ERP/components/Student/CourseVault/CourseVault.jsx', 'w') as f:
    f.write(content)
