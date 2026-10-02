import re

with open('Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx', 'r') as f:
    content = f.read()

new_header = """<div className="w-full animate-fade-in pb-12 font-sans bg-themeApp min-h-screen text-themeText">
 <div className="w-full mx-auto pb-10">
 <div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full flex flex-col gap-6">
 <PageHeader 
 icon="fa-brands fa-whatsapp" 
 title="WhatsApp Engine (Experimental)" 
 subtitle="Manage internal WhatsApp notifications queue and connectivity." 
 />
 <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-sm font-semibold flex gap-3 items-start">
 <i className="fa-solid fa-triangle-exclamation mt-1"></i>
 <div>
 <p className="font-bold text-rose-500 uppercase tracking-widest text-xs mb-1">Experimental Feature</p>
 <p>This engine is highly experimental. The QR code provided below is an internal system link, it is <strong>NOT</strong> from WhatsApp and it <strong>does not work</strong> in the official WhatsApp app scanner.</p>
 </div>
 </div>
 </div>"""

content = re.sub(r'<div className="w-full animate-fade-in pb-12 font-sans bg-themeApp min-h-screen text-themeText">\n <div className="w-full mx-auto pb-10">\n <div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">\n <PageHeader \n icon="fa-brands fa-whatsapp" \n title="WhatsApp Engine" \n subtitle="Manage WhatsApp Web link and outbound message queue" \n />\n </div>', new_header, content)

with open('Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx', 'w') as f:
    f.write(content)
