const fs = require('fs');

// Fix ErpApp.jsx
let erpFile = 'Frontend/ERP/ErpApp.jsx';
let erpContent = fs.readFileSync(erpFile, 'utf8');
if (!erpContent.includes('<Route path="/parent/*"')) {
    erpContent = erpContent.replace(
        /<Route path="\/admin\/\*" element=\{renderLayout\(\)\} \/>/,
        '<Route path="/admin/*" element={renderLayout()} />\n                            <Route path="/parent/*" element={renderLayout()} />'
    );
    fs.writeFileSync(erpFile, erpContent);
}

// Fix RootApp.jsx
let rootFile = 'Frontend/RootApp.jsx';
let rootContent = fs.readFileSync(rootFile, 'utf8');
if (!rootContent.includes("location.pathname.startsWith('/parent')")) {
    rootContent = rootContent.replace(
        /location\.pathname\.startsWith\('\/admin'\) \|\|/,
        "location.pathname.startsWith('/admin') ||\n    location.pathname.startsWith('/parent') ||"
    );
    fs.writeFileSync(rootFile, rootContent);
}
