const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminMarksController/AdminMarksController.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldTabs = `{ id: 'corrections', label: 'Correction Tickets', count: corrections.filter(c => c.status === 'pending').length, icon: 'fa-ticket' }
                            ].map(tab => (`;
const newTabs = `{ id: 'corrections', label: 'Correction Tickets', count: corrections.filter(c => c.status === 'pending').length, icon: 'fa-ticket' },
                                { id: 'override', label: 'Manual Override', count: 0, icon: 'fa-user-pen' }
                            ].map(tab => (`;
                            
content = content.replace(oldTabs, newTabs);
fs.writeFileSync(file, content);
