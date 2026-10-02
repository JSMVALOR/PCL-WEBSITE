const fs = require('fs');
let path = 'Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = ` const fetchStatus = async () => {
   try {
     const res = await fetch(\`\${ENGINE_URL}/api/whatsapp/status\`);
     if (res.ok) {
       const data = await res.json();
       if (data.status === 'CONNECTED') {
         setStatus('CONNECTED');
       } else if (data.status === 'QR_READY') {
         setStatus('UNLINKED');
         setQrCode(data.qr);
       } else {
         setStatus('LOADING');
       }
     }
   } catch (e) {
     console.warn("WhatsApp Engine unreachable at", ENGINE_URL);
   }
 };`;

const replacement = ` const fetchStatus = async () => {
   try {
     const res = await fetch(\`\${ENGINE_URL}/api/whatsapp/status\`);
     if (res.ok) {
       const data = await res.json();
       setStatus(prev => {
         if (data.status === 'CONNECTED' && prev !== 'CONNECTED') return 'CONNECTED';
         if (data.status === 'QR_READY' && prev !== 'UNLINKED') return 'UNLINKED';
         if (data.status !== 'CONNECTED' && data.status !== 'QR_READY' && prev !== 'LOADING') return 'LOADING';
         return prev;
       });
       if (data.status === 'QR_READY') {
         setQrCode(prev => prev === data.qr ? prev : data.qr);
       }
     }
   } catch (e) {
     console.warn("WhatsApp Engine unreachable at", ENGINE_URL);
   }
 };`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log("Fixed status flickering in AdminWhatsAppQueue.jsx");
} else {
    console.log("Could not find target block for status in AdminWhatsAppQueue.jsx");
}
