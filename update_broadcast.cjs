const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', 'utf8');

// Add state variables
code = code.replace(
  'const [requiresAck, setRequiresAck] = useState(false);',
  'const [requiresAck, setRequiresAck] = useState(false);\n const [externalLink, setExternalLink] = useState("");\n const [isPublicWebsite, setIsPublicWebsite] = useState(false);'
);

// Update handlePublishNotice
code = code.replace(
  'target_audience: targetAudience,\n requires_acknowledgement: requiresAck,\n author_id: userSession?.db_id',
  'target_audience: targetAudience,\n requires_acknowledgement: requiresAck,\n author_id: userSession?.db_id,\n external_link: externalLink || null'
);

// Add the insert for admin_notices
code = code.replace(
  'if (error) throw error;\n \n setTitle("");',
  `if (error) throw error;
 
 if (isPublicWebsite) {
    await supabase.from('admin_notices').insert([{
        title,
        content,
        category: 'Notice',
        is_public: true,
        image_url: externalLink || null
    }]);
 }

 setTitle("");`
);

// Clear the new state on success
code = code.replace(
  'setRequiresAck(false);\n fetchNotices();',
  'setRequiresAck(false);\n setExternalLink("");\n setIsPublicWebsite(false);\n fetchNotices();'
);

// Add inputs to JSX
const externalLinkJsx = `
 <div className="grid grid-cols-1 gap-4">
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">External Link (Optional)</label>
 <input type="url" value={externalLink} onChange={e => setExternalLink(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" placeholder="https://..." />
 </div>
 </div>
`;

const toggleJsx = `
 <label className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-xl cursor-pointer">
 <div>
 <span className="text-sm font-bold text-themeText block">Publish to Public Website</span>
 <span className="text-[10px] font-bold text-themeTextSec">Make this broadcast visible on the main website</span>
 </div>
 <div className={\`w-10 h-6 rounded-full p-1 transition-colors \${isPublicWebsite ? 'bg-themeAccent' : 'bg-black/10 dark:bg-white/10'}\`}>
 <div className={\`w-4 h-4 bg-white rounded-full transition-transform \${isPublicWebsite ? 'translate-x-4' : 'translate-x-0'}\`}></div>
 </div>
 <input type="checkbox" checked={isPublicWebsite} onChange={e => setIsPublicWebsite(e.target.checked)} className="hidden" />
 </label>
`;

code = code.replace(
  '</textarea>\n </div>\n <label className="flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5',
  `</textarea>\n </div>\n ${externalLinkJsx}\n <label className="flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5`
);

code = code.replace(
  '</label>\n <button type="submit" disabled={isPublishing}',
  `</label>\n ${toggleJsx}\n <button type="submit" disabled={isPublishing}`
);

fs.writeFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', code);
console.log("Updated AdminNotices.jsx");
