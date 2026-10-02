const fs = require('fs');
let path = 'Backend/whatsapp-engine/server.js';
let content = fs.readFileSync(path, 'utf8');

const oldLogic = `            let formattedPhone = msg.phone.replace(/[^0-9]/g, '');
            if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
                formattedPhone = '91' + formattedPhone;
            }
            const jid = \`\${formattedPhone}@s.whatsapp.net\`;

            try {
                // Check if registered
                const [result] = await sock.onWhatsApp(jid);
                if (!result?.exists) {
                    throw new Error('Phone number not registered on WhatsApp');
                }

                // Send message
                await sock.sendMessage(result.jid, { text: msg.message });`;

const newLogic = `            let jid = '';
            let isGroup = msg.phone.length > 13 || msg.phone.startsWith('G:');
            
            if (isGroup) {
                const cleanId = msg.phone.replace('G:', '').replace('@g.us', '');
                jid = cleanId + '@g.us';
            } else {
                let formattedPhone = msg.phone.replace(/[^0-9]/g, '');
                if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
                    formattedPhone = '91' + formattedPhone;
                }
                jid = \`\${formattedPhone}@s.whatsapp.net\`;
            }

            try {
                let targetJid = jid;
                
                if (!isGroup) {
                    // Check if registered
                    const [result] = await sock.onWhatsApp(jid);
                    if (!result?.exists) {
                        throw new Error('Phone number not registered on WhatsApp');
                    }
                    targetJid = result.jid;
                }

                // Send message
                await sock.sendMessage(targetJid, { text: msg.message });`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(path, content);
console.log('Patched whatsapp-engine/server.js processing loop');
