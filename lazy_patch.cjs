const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/ErpApp.jsx', 'utf8');

// Find all import statements in ErpApp.jsx that are not shared shell components
const lines = file.split('\n');
const newLines = [];
const lazyImports = [];

// Things we SHOULD NOT lazy load because they are layout/shell components
const eager = [
  'ValorLogo', 'TopNav', 'MobileNav', 'Sidebar', 'FacultySidebar', 'AdminSidebar',
  'DialogContainer', 'ToastContainer', 'GlobalSearch', 'ErrorBoundary',
  'QuestionnaireModal', 'ForcePasswordChangeModal', 'SessionTimeoutGuard',
  'RoleActionButton', 'IntelligentBot', 'Login', 'OTPVerification'
];

lines.forEach(line => {
  if (line.startsWith('import ') && line.includes('./components/')) {
    const match = line.match(/import\s+([A-Za-z0-9_]+)\s+from\s+['"](.+)['"]/);
    if (match) {
      const compName = match[1];
      const compPath = match[2];
      if (!eager.includes(compName)) {
        // Convert to React.lazy
        lazyImports.push(`const ${compName} = React.lazy(() => import('${compPath}'));`);
        return; // skip adding the static import
      }
    }
  }
  newLines.push(line);
});

// Insert lazy imports after the last static import
let lastImportIndex = 0;
for (let i = 0; i < newLines.length; i++) {
  if (newLines[i].startsWith('import ')) {
    lastImportIndex = i;
  }
}

newLines.splice(lastImportIndex + 1, 0, '\n// --- LAZY LOADED ROUTE COMPONENTS ---', ...lazyImports, '\n');

// Wrap renderContent with Suspense
let updatedFile = newLines.join('\n');

const suspenseWrapper = `
      <div className="flex-1 p-0 pb-[130px] lg:pb-0 flex flex-col relative z-10">
        <ErrorBoundary>
          <React.Suspense fallback={<div className="flex items-center justify-center w-full h-full min-h-[400px]"><i className="fa-solid fa-circle-notch fa-spin text-themeAccent text-3xl"></i></div>}>
            {renderContent()}
          </React.Suspense>
        </ErrorBoundary>
      </div>`;

updatedFile = updatedFile.replace(
  /<div className="flex-1 p-0 pb-\[130px\] lg:pb-0 flex flex-col relative z-10">\s*<ErrorBoundary>\s*\{renderContent\(\)\}\s*<\/ErrorBoundary>\s*<\/div>/g,
  suspenseWrapper
);

// We also need to make sure React.Suspense works by ensuring React is imported if not already
if (!updatedFile.includes("import React")) {
  updatedFile = "import React, { useState, useEffect } from 'react';\n" + updatedFile;
}

// CredentialVerification is rendered in Routes directly, so it needs Suspense too
updatedFile = updatedFile.replace(
  /<Route path="\/verify\/:id" element=\{<CredentialVerification \/>\} \/>/,
  '<Route path="/verify/:id" element={<React.Suspense fallback={<div className="p-8">Loading...</div>}><CredentialVerification /></React.Suspense>} />'
);

fs.writeFileSync('Frontend/ERP/ErpApp.jsx', updatedFile);
console.log("ErpApp.jsx patched for React.lazy");
