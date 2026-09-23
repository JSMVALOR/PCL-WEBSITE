import re

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'r') as f:
    content = f.read()

# Fix the payload to handle empty date
old_payload = r""" const payload = \{
 student_id: studentId,
 category: formData\.category,
 title: formData\.title,
 issuer: formData\.issuer,
 date_achieved: formData\.date_achieved,
 role: formData\.role,
 description: formData\.description,
 proof_link: formData\.proof_link,
 include_in_cv: formData\.include_in_cv,
 status: 'pending'
 \};"""

new_payload = """ const payload = {
 student_id: studentId,
 category: formData.category,
 title: formData.title,
 issuer: formData.issuer,
 date_achieved: formData.date_achieved ? formData.date_achieved : null,
 role: formData.role,
 description: formData.description,
 proof_link: formData.proof_link,
 include_in_cv: formData.include_in_cv,
 status: 'pending'
 };"""

content = content.replace(old_payload, new_payload)

# Fix the error message
old_err = r'window\.erpDialog\.alert\("Failed to add achievement\."\);'
new_err = 'window.erpDialog.alert("Failed to add achievement: " + (err?.message || err?.details || JSON.stringify(err)));'

content = re.sub(old_err, new_err, content)

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'w') as f:
    f.write(content)
