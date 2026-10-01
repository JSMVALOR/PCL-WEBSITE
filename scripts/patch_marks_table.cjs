const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminMarksController/AdminMarksController.jsx', 'utf8');

file = file.replace(
    /<table className="w-full text-left border-collapse">/g,
    '<table className="w-full text-left border-collapse block md:table">'
).replace(
    /<thead>/g,
    '<thead className="hidden md:table-header-group">'
).replace(
    /<tr key=\{sub\.id\} className="border-b border-themeBorder\/50 hover:bg-themeElevated\/20 transition-colors">/g,
    '<tr key={sub.id} className="block md:table-row border-b border-themeBorder/50 hover:bg-themeElevated/20 transition-colors p-4 md:p-0">'
).replace(
    /<td className="px-6 py-4">/g,
    '<td className="block md:table-cell px-2 py-1 md:px-6 md:py-4">'
).replace(
    /<td className="px-6 py-4 text-center">/g,
    '<td className="block md:table-cell px-2 py-1 md:px-6 md:py-4 md:text-center">'
).replace(
    /<td className="px-6 py-4 text-right">/g,
    '<td className="block md:table-cell px-2 py-2 md:px-6 md:py-4 md:text-right mt-2 md:mt-0 flex items-center md:block gap-2">'
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminMarksController/AdminMarksController.jsx', file);
