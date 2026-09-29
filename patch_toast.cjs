const fs = require('fs');

// Fix ToastContainer.jsx
const fileToast = 'Frontend/ERP/components/shared/ToastContainer.jsx';
let contentToast = fs.readFileSync(fileToast, 'utf8');

// Replace the icon render block
const iconOld = `{toast.type === 'undo' ? (
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                            <i className="fa-solid fa-check"></i>
                        </div>
                    )}`;

const iconNew = `{toast.type === 'undo' ? (
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                    ) : toast.type === 'error' ? (
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                            <i className="fa-solid fa-check"></i>
                        </div>
                    )}`;

contentToast = contentToast.replace(iconOld, iconNew);
fs.writeFileSync(fileToast, contentToast);

// Fix EventsBoard.jsx
const fileEvents = 'Frontend/ERP/components/notices/EventsBoard.jsx';
let contentEvents = fs.readFileSync(fileEvents, 'utf8');
contentEvents = contentEvents.replace(/setShowSuccessModal\(true\);/g, 'if (window.erpToast) window.erpToast.show("Event published successfully!", "success");');
// Remove showSuccessModal modal block
contentEvents = contentEvents.replace(/\{showSuccessModal && \([\s\S]*?\}\)/, '');
contentEvents = contentEvents.replace(/const \[showSuccessModal, setShowSuccessModal\] = useState\(false\);/, '');
fs.writeFileSync(fileEvents, contentEvents);

// Fix AdminNotices.jsx
const fileNotices = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let contentNotices = fs.readFileSync(fileNotices, 'utf8');
contentNotices = contentNotices.replace(/setShowSuccessModal\(true\);/g, 'if (window.erpToast) window.erpToast.show("Broadcast published successfully!", "success");');
// Remove showSuccessModal modal block
contentNotices = contentNotices.replace(/\{showSuccessModal && \([\s\S]*?\}\)/, '');
contentNotices = contentNotices.replace(/const \[showSuccessModal, setShowSuccessModal\] = useState\(false\);\n/, '');
fs.writeFileSync(fileNotices, contentNotices);

