const fs = require('fs');

const path = 'Backend/whatsapp-engine/server.js';
let content = fs.readFileSync(path, 'utf8');

const groupEndpoint = `
app.get('/api/whatsapp/groups', async (req, res) => {
    try {
        if (!sock || clientStatus !== 'CONNECTED') {
            return res.status(400).json({ error: 'WhatsApp not connected' });
        }
        
        // Fetch all groups from store or directly
        const groupMetadata = await sock.groupFetchAllParticipating();
        const groups = Object.values(groupMetadata).map(g => ({
            id: g.id,
            name: g.subject,
            participants: g.participants.length
        }));
        
        res.json({ groups });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// The Throttle Queue Loop
`;

content = content.replace('// The Throttle Queue Loop\n', groupEndpoint);
fs.writeFileSync(path, content);
console.log('Added /api/whatsapp/groups endpoint');
