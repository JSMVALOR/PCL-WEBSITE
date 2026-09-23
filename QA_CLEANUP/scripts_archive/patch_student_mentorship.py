import re

with open('src/ERP/components/Student/Mentorship/Mentorship.jsx', 'r') as f:
    content = f.read()

# Add import
import_statement = "import MentorshipChatHub from '../../shared/MentorshipChatHub';\n"
if "MentorshipChatHub" not in content:
    content = content.replace('import { supabase }', import_statement + "import { supabase }")

# Add component at the end of the return statement
component = """
                {mentorData?.id && (
                    <MentorshipChatHub 
                        receiverId={mentorData.id}
                        receiverName={mentorData.full_name}
                        receiverRole="Mentor"
                        receiverAvatar={mentorData.profile_picture_url}
                    />
                )}
            </div>
        </div>
    );
"""
content = re.sub(r'            </div>\n        </div>\n    \);\n}$', component + "}", content)

with open('src/ERP/components/Student/Mentorship/Mentorship.jsx', 'w') as f:
    f.write(content)
