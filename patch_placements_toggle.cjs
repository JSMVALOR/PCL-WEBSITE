const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/AdminPlacements/AdminPlacements.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldToggle = `        const newStatus = drive.status === 'Open' ? 'Closed' : 'Open';
        const { error } = await supabase.from('placement_drives').update({ status: newStatus }).eq('id', drive.id);
        if (!error) fetchDrives();`;

const newToggle = `        const newStatus = drive.status === 'Open' ? 'Closed' : 'Open';
        const { error } = await supabase.from('placement_drives').update({ status: newStatus }).eq('id', drive.id);
        if (error) {
            if(window.erpToast) window.erpToast.show("Failed to toggle drive status.", "error");
        } else {
            if(window.erpToast) window.erpToast.show(\`Drive status updated to \${newStatus}\`, "success");
            fetchDrives();
        }`;

content = content.replace(oldToggle, newToggle);
fs.writeFileSync(file, content);
