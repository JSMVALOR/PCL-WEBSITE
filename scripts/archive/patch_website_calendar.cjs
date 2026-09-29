const fs = require('fs');
const file = 'Frontend/Website/components/NAVBAR/ACADEMICS/AcademicCalendar.jsx';
let content = fs.readFileSync(file, 'utf8');

// Remove jsPDF imports
content = content.replace("import jsPDF from 'jspdf';\n", '');
content = content.replace("import 'jspdf-autotable';\n", '');

// Remove the download button block
const buttonRegex = /<div className="flex gap-3">[\s\S]*?<\/div>/;
content = content.replace(buttonRegex, '<div className="flex gap-3"></div>');

// Remove pdfUrl fetch block
const pdfFetchRegex = /\/\/ Fetch generic PDF URL fallback[\s\S]*?\} catch \(err\)/;
content = content.replace(pdfFetchRegex, '} catch (err)');

fs.writeFileSync(file, content);
