import re

with open('src/ERP/components/Student/Notices/Notices.jsx', 'r') as f:
    content = f.read()

content = content.replace(
    'onNoticePublished={() => { setIsBroadcasting(false); window.location.reload(); }}',
    'onNoticePublished={async () => { setIsBroadcasting(false); await window.erpDialog?.alert("Notice successfully published to the notice board.", "Broadcast Sent"); window.location.reload(); }}'
)

with open('src/ERP/components/Student/Notices/Notices.jsx', 'w') as f:
    f.write(content)
