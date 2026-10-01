const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx', 'utf8');

// Add editColumn function
const editColumnFunc = `
 const editColumn = async (oldName) => {
 const newName = await window.erpDialog.prompt("Enter new column name:", oldName);
 if (!newName || newName === oldName || columns.includes(newName)) return;
 
 setColumns(columns.map(c => c === oldName ? newName : c));
 setRows(rows.map(r => {
 const newData = { ...r.data };
 newData[newName] = newData[oldName];
 delete newData[oldName];
 return { ...r, data: newData };
 }));
 };
`;

file = file.replace(
    /const deleteColumn = async/,
    editColumnFunc + '\n const deleteColumn = async'
);

// Update table header to include S.No and Edit button
file = file.replace(
    /<tr className="border-b border-themeBorder">([\s\S]*?)<\/tr>/,
    `<tr className="border-b border-themeBorder">
 <th className="p-4 text-[10px] font-black text-themeTextSec uppercase tracking-widest w-12 text-center">S.No</th>
 {columns.map(col => (
 <th key={col} className="p-4 text-xs font-bold text-themeText uppercase tracking-widest min-w-[150px] group relative group/th">
 <span className="flex items-center gap-2">
 {col}
 <button onClick={() => editColumn(col)} className="opacity-0 group-hover/th:opacity-100 text-themeTextSec hover:text-themeAccent transition-opacity" title="Edit Column Name"><i className="fa-solid fa-pen-to-square text-[10px]"></i></button>
 </span>
 <button 
 onClick={() => deleteColumn(col)} 
 className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/th:opacity-100 text-rose-500 hover:text-rose-600 transition-opacity"
 title="Delete Column"
 >
 <i className="fa-solid fa-trash-can"></i>
 </button>
 </th>
 ))}
 <th className="w-16 p-4"></th>
 </tr>`
);

// Update table body to include S.No
file = file.replace(
    /<tr key=\{row\.id\} className="border-b border-themeBorder last:border-none hover:bg-themeElevated transition-colors group">\s*\{columns\.map/,
    `<tr key={row.id} className="border-b border-themeBorder last:border-none hover:bg-themeElevated transition-colors group">
 <td className="p-2 text-center text-[10px] font-black text-themeTextSec">{idx + 1}</td>
 {columns.map`
);

fs.writeFileSync('Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx', file);
