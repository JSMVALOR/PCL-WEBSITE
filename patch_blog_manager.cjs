const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/BlogManager/BlogManager.jsx', 'utf8');

const oldTableStr = `<div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">`;

// I will just use regex to replace the entire div with overflow-x-auto containing the table.
const regex = /<div className="overflow-x-auto">[\s\S]*?<\/table>\s*<\/div>/;

const newLayout = `
<div className="hidden lg:block overflow-x-auto">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="bg-themeElevated backdrop-blur-md border-b border-themeBorder">
        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Title</th>
        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Author</th>
        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Date</th>
        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Status</th>
        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec text-right">Actions</th>
      </tr>
    </thead>
    <tbody>
      {isLoading ? (
        <tr>
          <td colSpan="5" className="p-8 text-center text-sm font-black text-themeTextSec uppercase tracking-widest">
            <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading Posts...
          </td>
        </tr>
      ) : blogs.length === 0 ? (
        <tr>
          <td colSpan="5" className="p-8 text-center text-sm font-black text-themeTextSec uppercase tracking-widest">
            No blog posts found.
          </td>
        </tr>
      ) : (
        blogs.map((blog) => (
          <tr key={blog.id} className="border-b border-themeBorder hover:bg-themeElevated/50 transition-colors">
            <td className="p-4 max-w-xs">
              <p className="text-sm font-bold text-themeText truncate">{blog.title}</p>
              <p className="text-[10px] font-medium text-themeTextSec mt-0.5 truncate">/{blog.slug}</p>
            </td>
            <td className="p-4 text-xs font-bold text-themeText truncate max-w-[150px]">
              {blog.author_name || "Unknown"}
              {blog.author_email && (
                <span className="block text-[9px] text-themeTextSec font-mono mt-1" title={blog.author_email}>
                  <i className="fa-solid fa-envelope mr-1"></i>Contact Available
                </span>
              )}
            </td>
            <td className="p-4 text-xs font-bold text-themeTextSec whitespace-nowrap">{new Date(blog.created_at).toLocaleDateString()}</td>
            <td className="p-4">
              {blog.is_public ? (
                <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded whitespace-nowrap">Published</span>
              ) : (
                <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded whitespace-nowrap">Pending</span>
              )}
            </td>
            <td className="p-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => handleEdit(blog)} className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500 hover:text-themeText text-blue-500 border border-blue-500/20 flex items-center justify-center transition-colors" title="Review & Edit">
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

<div className="lg:hidden flex flex-col divide-y divide-themeBorder">
  {isLoading ? (
    <div className="p-8 text-center text-sm font-black text-themeTextSec uppercase tracking-widest">
      <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading Posts...
    </div>
  ) : blogs.length === 0 ? (
    <div className="p-8 text-center text-sm font-black text-themeTextSec uppercase tracking-widest">
      No blog posts found.
    </div>
  ) : (
    blogs.map((blog) => (
      <div key={blog.id} className="p-4 flex flex-col gap-3 hover:bg-themeElevated/50 transition-colors group relative">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-themeText text-[15px] truncate">{blog.title}</h4>
            <p className="text-[11px] font-medium text-themeTextSec mt-1 truncate">/{blog.slug}</p>
          </div>
          <span className={\`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest shrink-0 \${
            blog.is_public ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
            'bg-amber-500/10 text-amber-500 border border-amber-500/20'
          }\`}>
            {blog.is_public ? 'Published' : 'Pending'}
          </span>
        </div>
        
        <div className="flex flex-col gap-1.5 mt-1 bg-themeElevated/50 p-3 rounded-xl border border-themeBorder/50">
          <div className="flex items-center text-xs">
            <span className="w-20 font-black tracking-wider uppercase text-[10px] text-themeTextSec">Author</span>
            <span className="font-bold text-themeText flex-1 truncate">{blog.author_name || "Unknown"}</span>
          </div>
          <div className="flex items-center text-xs">
             <span className="w-20 font-black tracking-wider uppercase text-[10px] text-themeTextSec">Date</span>
             <span className="font-bold text-themeText">{new Date(blog.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex justify-end mt-1">
          <button type="button" onClick={() => handleEdit(blog)} className="w-full py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500 hover:text-themeApp text-blue-500 font-black tracking-widest text-xs uppercase transition-colors flex items-center justify-center gap-2">
            <i className="fa-solid fa-pen-to-square"></i> Review & Edit
          </button>
        </div>
      </div>
    ))
  )}
</div>
`;

file = file.replace(regex, newLayout);
fs.writeFileSync('Frontend/ERP/components/Admin/BlogManager/BlogManager.jsx', file);
