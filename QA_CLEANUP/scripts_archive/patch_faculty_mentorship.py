import re

with open('src/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx', 'r') as f:
    content = f.read()

import_statement = "import MentorshipChatHub from '../../shared/MentorshipChatHub';\n"
if "MentorshipChatHub" not in content:
    content = content.replace('import { supabase }', import_statement + "import { supabase }")

# Insert before the end of the return statement
component = """
                {selectedMentee && (
                    <MentorshipChatHub 
                        receiverId={selectedMentee.id}
                        receiverName={selectedMentee.full_name}
                        receiverRole="Mentee"
                        receiverAvatar={selectedMentee.profile_picture_url}
                    />
                )}
            </div>
        </div>
    );
"""
content = re.sub(r'            </div>\n        </div>\n    \);\n}$', component + "}", content)

with open('src/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx', 'w') as f:
    f.write(content)
