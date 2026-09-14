import os

base_path = '/Users/JSM/Developer/PRUDENTIA COLLEGE OF LAW/PCL WEBSITE V6/'

# 1. App.jsx
file_path = os.path.join(base_path, 'src/App.jsx')
with open(file_path, 'r') as f:
    content = f.read()
content = content.replace('NAVBAR/Contact/Contact', 'NAVBAR/CONTACT/Contact')
content = content.replace('NAVBAR/Events/EventsPage', 'NAVBAR/EVENTS/EventsPage')
content = content.replace('NAVBAR/Events/EventDetail', 'NAVBAR/EVENTS/EventDetail')
with open(file_path, 'w') as f:
    f.write(content)

# 2. PlacementCell.jsx
file_path = os.path.join(base_path, 'src/Website/components/NAVBAR/CAREERS/PlacementCell.jsx')
with open(file_path, 'r') as f:
    content = f.read()
content = content.replace('Send } from', 'Send, ArrowRight } from')
with open(file_path, 'w') as f:
    f.write(content)

# 3. ErpApp.jsx
file_path = os.path.join(base_path, 'src/ERP/ErpApp.jsx')
with open(file_path, 'r') as f:
    content = f.read()
content = content.replace('{navLayout === \'topnav\' && <MobileNav', '{<MobileNav')
with open(file_path, 'w') as f:
    f.write(content)

# 4. LeadershipProfile.jsx
file_path = os.path.join(base_path, 'src/Website/components/NAVBAR/ABOUT/LeadershipProfile/LeadershipProfile.jsx')
with open(file_path, 'r') as f:
    content = f.read()
content = content.replace('let parsedBio = profile.bio;', 'if (!profile) return <NotFound404 />;\n    let parsedBio = profile.bio;')
with open(file_path, 'w') as f:
    f.write(content)

# 5. gradle-wrapper.properties
file_path = os.path.join(base_path, 'android/gradle/wrapper/gradle-wrapper.properties')
if os.path.exists(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    content = content.replace('distributionUrl=file\\:///Users/JSM/Developer/PRUDENTIA%20COLLEGE%20OF%20LAW/PCL%20WEBSITE%20V6/android/gradle-8.14.3-all.zip', 'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.14.3-all.zip')
    with open(file_path, 'w') as f:
        f.write(content)

# 6. api/send-email.js
file_path = os.path.join(base_path, 'api/send-email.js')
if os.path.exists(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    content = content.replace("const nodemailer = require('nodemailer');", "import nodemailer from 'nodemailer';")
    with open(file_path, 'w') as f:
        f.write(content)

# 7. EmailService.js
file_path = os.path.join(base_path, 'src/ERP/lib/EmailService.js')
if os.path.exists(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    content = content.replace("import.meta.env.VITE_EMAIL_SERVER_URL || 'http://localhost:3001/send-email'", "'https://prudentiacollege.edu/api/send-email'")
    with open(file_path, 'w') as f:
        f.write(content)

print("Web/Config fixes applied.")
