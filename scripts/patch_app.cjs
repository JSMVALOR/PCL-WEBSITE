const fs = require('fs');
const file = 'Frontend/App.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useEffect(() => {')) {
  // Need to import useEffect
  content = content.replace("import React from 'react';", "import React, { useEffect } from 'react';");
  
  // Add useEffect to App component
  content = content.replace(
    'function App() {',
    `function App() {
  // Clear any ERP themes that might bleed into the main website
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
  }, []);
`
  );
  fs.writeFileSync(file, content);
}
