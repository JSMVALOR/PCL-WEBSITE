const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace alert with custom state
content = content.replace(
    'if (window.toast) window.toast.success("Broadcast published successfully!"); else alert("Broadcast published successfully!");',
    'if (window.erpToast) { window.erpToast.show("Broadcast published successfully!", "success"); } else { setShowSuccessModal(true); }'
);

// We need to add showSuccessModal state
if (!content.includes('const [showSuccessModal, setShowSuccessModal]')) {
    content = content.replace('const [title, setTitle] = useState("");', 'const [showSuccessModal, setShowSuccessModal] = useState(false);\n const [title, setTitle] = useState("");');
}

// Add the modal UI at the bottom of the component
if (!content.includes('id="success-modal"')) {
    const modalUI = `
    {showSuccessModal && (
        <div id="success-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-themePanel/95 backdrop-blur-3xl border border-themeBorder shadow-premium rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center transform animate-fade-in-up">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    <i className="fa-solid fa-check"></i>
                </div>
                <h3 className="text-xl font-bold text-themeText mb-2">Success!</h3>
                <p className="text-themeTextSec text-sm mb-6">Broadcast published successfully to the selected audience.</p>
                <button 
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full bg-themeAccent hover:bg-themeAccent/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-themeAccent/20"
                >
                    Continue
                </button>
            </div>
        </div>
    )}
    `;
    // inject before the final return closing div
    const lastClosingDivIndex = content.lastIndexOf('</div>');
    content = content.substring(0, lastClosingDivIndex) + modalUI + content.substring(lastClosingDivIndex);
}

// Also let's fix the notification tagging bug and add notifications
// I need to analyze the publish logic first. I won't write to file yet.
