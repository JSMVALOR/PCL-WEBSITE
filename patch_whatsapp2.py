import re

with open('Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx', 'r') as f:
    content = f.read()

old_banner = """<p>This engine is highly experimental. The QR code provided below is an internal system link, it is <strong>NOT</strong> from WhatsApp and it <strong>does not work</strong> in the official WhatsApp app scanner.</p>"""

new_banner = """<p>This engine relies on an experimental web bridge. <strong>How to connect:</strong> Open your official WhatsApp mobile app, go to Settings &gt; Linked Devices, and scan the QR code below. (Do not use your phone's default camera or a generic QR scanner).</p>"""

content = content.replace(old_banner, new_banner)

with open('Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx', 'w') as f:
    f.write(content)
