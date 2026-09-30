const fs = require('fs');

const file1 = 'Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyEditorModal.jsx';
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace(/alert\("Could not load current image for cropping due to CORS or network error\."\);/g, 'if(window.erpToast) window.erpToast.show("Could not load current image for cropping.", "error");');
content1 = content1.replace(/window\.alert\("Warning: Could not upload the image\. Please ensure the 'avatars' storage bucket exists in Supabase\. The text changes will still be saved\."\);/g, 'if(window.erpToast) window.erpToast.show("Warning: Could not upload the image.", "error");');
fs.writeFileSync(file1, content1);

const file2 = 'Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx';
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace(/alert\("Could not load current image for cropping due to CORS or network error\."\);/g, 'if(window.erpToast) window.erpToast.show("Could not load current image for cropping.", "error");');
content2 = content2.replace(/alert\("User details updated successfully!"\);/g, 'if(window.erpToast) window.erpToast.show("User details updated successfully!", "success");');
content2 = content2.replace(/else alert\("Failed to save changes: " \+ err\.message\);/g, 'else if(window.erpToast) window.erpToast.show("Failed to save changes: " + err.message, "error");');
fs.writeFileSync(file2, content2);

const file3 = 'Frontend/ERP/components/Admin/AdminAcademicCalendar/AdminAcademicCalendar.jsx';
let content3 = fs.readFileSync(file3, 'utf8');
content3 = content3.replace(/alert\("Event updated successfully!"\);/g, 'if(window.erpToast) window.erpToast.show("Event updated successfully!", "success");');
content3 = content3.replace(/alert\("Event added successfully!"\);/g, 'if(window.erpToast) window.erpToast.show("Event added successfully!", "success");');
content3 = content3.replace(/alert\("Event deleted\."\);/g, 'if(window.erpToast) window.erpToast.show("Event deleted.", "success");');
fs.writeFileSync(file3, content3);

const file4 = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content4 = fs.readFileSync(file4, 'utf8');
content4 = content4.replace(/else alert\("Event scheduled successfully!"\);/g, ''); // Since there's already window.toast.success before it, we just remove the fallback. Wait, window.toast was replaced by fix_global_toasts.cjs! Let's check what's there.
fs.writeFileSync(file4, content4);

const file5 = 'Frontend/ERP/components/Admin/AdminWebsiteHub/AdminGalleryManager.jsx';
let content5 = fs.readFileSync(file5, 'utf8');
content5 = content5.replace(/if \(!window\.confirm\("This will automatically upload all 11 original images to Supabase\. Proceed\?"\)\) return;/g, 
    'if (!await new Promise(res => window.erpDialog ? window.erpDialog.confirm("This will automatically upload all 11 original images to Supabase. Proceed?", res) : res(window.confirm("Proceed?")))) return;');
content5 = content5.replace(/alert\("Auto-Sync Complete!"\);/g, 'if(window.erpToast) window.erpToast.show("Auto-Sync Complete!", "success");');
content5 = content5.replace(/alert\("Please select an image file to upload\."\);/g, 'if(window.erpToast) window.erpToast.show("Please select an image file to upload.", "error");');
content5 = content5.replace(/if \(!window\.confirm\("Are you sure you want to remove this image from the gallery\?"\)\) return;/g, 
    'if (!await new Promise(res => window.erpDialog ? window.erpDialog.confirm("Are you sure you want to remove this image from the gallery?", res) : res(window.confirm("Remove image?")))) return;');
fs.writeFileSync(file5, content5);

const file6 = 'Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx';
let content6 = fs.readFileSync(file6, 'utf8');
content6 = content6.replace(/alert\(\`Conflict Detected: \$\{conflictMsg\}\`\);/g, 'if(window.erpToast) window.erpToast.show(`Conflict Detected: ${conflictMsg}`, "error");');
fs.writeFileSync(file6, content6);

const file7 = 'Frontend/ERP/components/Admin/AdminPayroll/AdminPayroll.jsx';
let content7 = fs.readFileSync(file7, 'utf8');
content7 = content7.replace(/const confirmed = window\.confirm\("Are you sure you want to finalize this payroll disbursal\? This action will generate the encrypted PDF and cannot be undone\."\);/g, 
    'const confirmed = await new Promise(res => window.erpDialog ? window.erpDialog.confirm("Are you sure you want to finalize this payroll disbursal? This action will generate the encrypted PDF and cannot be undone.", res) : res(window.confirm("Finalize payroll?")));');
fs.writeFileSync(file7, content7);

