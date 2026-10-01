const fs = require('fs');

function patchFile(path) {
    if (!fs.existsSync(path)) return;
    let file = fs.readFileSync(path, 'utf8');
    
    // Replace password generation in UserProvisioningHub
    file = file.replace(
        /let generatedPassword = "Pcl#";\s*for \(let i = 0; i < 6; i\+\+\) \{\s*generatedPassword \+= chars\.charAt\(Math\.floor\(Math\.random\(\) \* chars\.length\)\);\s*\}/,
        `let generatedPassword = "PCL";
 const alphaNumChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
 for (let i = 0; i < 6; i++) {
 generatedPassword += alphaNumChars.charAt(Math.floor(Math.random() * alphaNumChars.length));
 }`
    );

    // Replace password generation in UserManagement
    file = file.replace(
        /let newPass = "Pcl#";\s*for \(let i = 0; i < 6; i\+\+\) \{\s*newPass \+= chars\.charAt\(Math\.floor\(Math\.random\(\) \* chars\.length\)\);\s*\}/,
        `let newPass = "PCL";
 const alphaNumChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
 for (let i = 0; i < 6; i++) {
 newPass += alphaNumChars.charAt(Math.floor(Math.random() * alphaNumChars.length));
 }`
    );

    fs.writeFileSync(path, file);
}

patchFile('Frontend/ERP/components/Admin/UserManagement/UserProvisioningHub.jsx');
patchFile('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx');

