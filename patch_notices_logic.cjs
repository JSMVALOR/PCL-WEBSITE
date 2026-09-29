const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace alert with custom modal
content = content.replace(
    'if (window.toast) window.toast.success("Broadcast published successfully!"); else alert("Broadcast published successfully!");',
    'if (window.erpToast) window.erpToast.show("Broadcast published successfully!", "success"); else setShowSuccessModal(true);'
);

if (!content.includes('const [showSuccessModal, setShowSuccessModal] = useState(false);')) {
    content = content.replace(
        'const [title, setTitle] = useState("");',
        'const [showSuccessModal, setShowSuccessModal] = useState(false);\n const [title, setTitle] = useState("");'
    );
}

// Add notification insertion logic
const notificationInsertStr = `
// NOTIFICATIONS INJECTION
try {
    const { data: users } = await supabase.from('profiles').select('id, erp_id, role, academic_batch');
    if (users && users.length > 0) {
        let recipientIds = [];
        if (targetAudience.includes('All')) {
            recipientIds = users.map(u => u.id);
        } else {
            users.forEach(u => {
                if (targetAudience.includes('Student') && u.role === 'student') recipientIds.push(u.id);
                else if (targetAudience.includes('Faculty') && u.role === 'faculty') recipientIds.push(u.id);
                else if (u.academic_batch && targetAudience.includes(u.academic_batch)) recipientIds.push(u.id);
                else if (targetAudience.includes(u.erp_id)) recipientIds.push(u.id);
            });
        }
        
        // Deduplicate
        recipientIds = [...new Set(recipientIds)];
        
        if (recipientIds.length > 0) {
            const notifs = recipientIds.map(rid => ({
                recipient_id: rid,
                title: 'New Broadcast: ' + title,
                message: content.substring(0, 50) + '...',
                type: 'notice'
            }));
            await supabase.from('notifications').insert(notifs);
        }
    }
} catch(e) { console.error('Failed to send real-time notifications', e); }
`;

content = content.replace(
    '// NOTIFICATIONS',
    notificationInsertStr + '\n // NOTIFICATIONS'
);

// Inject the success modal UI before the last closing div.
if (!content.includes('id="success-modal"')) {
    const modalUI = `
    {showSuccessModal && (
        <div id="success-modal" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-themePanel/95 backdrop-blur-3xl border border-black/5 dark:border-white/10 shadow-2xl rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center transform animate-fade-in-up">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    <i className="fa-solid fa-check"></i>
                </div>
                <h3 className="text-xl font-bold text-themeText mb-2">Success!</h3>
                <p className="text-themeTextSec text-sm mb-6">Broadcast published successfully to the selected audience.</p>
                <button 
                    type="button"
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full bg-themeAccent hover:bg-themeAccent/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-themeAccent/20"
                >
                    Continue
                </button>
            </div>
        </div>
    )}
    `;
    const lastClosingDivIndex = content.lastIndexOf('</div>');
    content = content.substring(0, lastClosingDivIndex) + modalUI + content.substring(lastClosingDivIndex);
}

fs.writeFileSync(file, content);
