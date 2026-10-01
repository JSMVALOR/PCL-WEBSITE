const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminWebsiteHub/AdminCareers.jsx', 'utf8');

// Replace is_active with status
file = file.replace(/is_active: true,/g, "status: 'Active', pdf_link: ''");
file = file.replace(/is_active: false,/g, "status: 'Inactive', pdf_link: ''");
file = file.replace(/is_active: e\.target\.value === "active"/g, "status: e.target.value");
file = file.replace(/value=\{formData\.is_active \? "active" : "inactive"\}/g, "value={formData.status}");
file = file.replace(/<option value="active">Active \(Visible\)<\/option>/g, '<option value="Active">Active (Visible)</option>');
file = file.replace(/<option value="inactive">Inactive \(Hidden\)<\/option>/g, '<option value="Inactive">Inactive (Hidden)</option>');

// In rendering the jobs:
file = file.replace(/job\.is_active \?/g, "job.status === 'Active' ?");
file = file.replace(/job\.type/g, "job.job_type");

// In formData
file = file.replace(/type: 'Full-time',/g, "job_type: 'Full-time',");
file = file.replace(/type: e\.target\.value/g, "job_type: e.target.value");
file = file.replace(/value=\{formData\.type\}/g, "value={formData.job_type}");

// Add pdf_link input field
const pdfLinkField = `
 <div className="flex flex-col gap-2 mt-4">
 <label className="text-[13px] font-medium text-themeTextSec">Job Description PDF (Drive Link)</label>
 <input type="url" className="bg-themeElevated dark:bg-themeElevated/90 backdrop-blur-md border border-themeBorder dark:border-white/[0.08] rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.pdf_link || ''} onChange={e => setFormData({...formData, pdf_link: e.target.value})} placeholder="https://drive.google.com/..." />
 <span className="text-[11px] text-themeTextSec mt-1">To save server space, paste a public Google Drive link to the PDF instead of uploading files.</span>
 </div>
`;

// Insert the pdf_link field before the submit button div
file = file.replace(/<div className="flex justify-between mt-4">/, pdfLinkField + '\n <div className="flex justify-between mt-4">');

fs.writeFileSync('Frontend/ERP/components/Admin/AdminWebsiteHub/AdminCareers.jsx', file);
