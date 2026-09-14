with open('src/ERP/lib/EmailService.js', 'r') as f:
    text = f.read()

import re
# Replace the hardcoded string with the env variable
text = text.replace(
    "const emailEndpoint = 'https://pcl-website.vercel.app/api/send-email';",
    "const emailEndpoint = (import.meta.env.VITE_SITE_URL || window.location.origin) + '/api/send-email';"
)

with open('src/ERP/lib/EmailService.js', 'w') as f:
    f.write(text)

