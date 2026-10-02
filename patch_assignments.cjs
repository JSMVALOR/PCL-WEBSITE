const fs = require('fs');

const path = 'Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let content = fs.readFileSync(path, 'utf8');

const formStart = content.indexOf('{showForm && (');
const listStart = content.indexOf('{/* ASSIGNMENTS LIST */}');
const alternativeListStart = content.indexOf('{!showForm && (');

if (formStart !== -1) {
    let formEndIdx = alternativeListStart !== -1 ? alternativeListStart : listStart;
    if (formEndIdx === -1) {
        // Fallback: look for </form> and then two closing divs.
        const formTagEnd = content.indexOf('</form>', formStart);
        formEndIdx = content.indexOf('</div>', content.indexOf('</div>', formTagEnd) + 6) + 6;
    }
    
    const originalForm = content.slice(formStart, formEndIdx);
    
    let modalForm = `
{showForm && createPortal(
    <div className="fixed inset-0 z-[200] bg-themeApp animate-fade-in flex flex-col overflow-y-auto">
        <div className="flex-1 w-full max-w-[1000px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-themeBorder sticky top-0 bg-themeApp z-10 pt-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: tColor.bg, color: tColor.primary }}>
                        <i className="fa-solid fa-file-signature"></i>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-themeText">{formData.id ? 'Edit Assignment' : 'Issue New Assignment'}</h2>
                        <p className="text-xs font-bold text-themeTextSec uppercase tracking-widest mt-1">Offline Submission Tracker</p>
                    </div>
                </div>
                <button type="button" onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full bg-themeElevated border border-themeBorder flex items-center justify-center text-themeTextSec hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-themePanel/40 backdrop-blur-3xl border border-themeBorder rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-xl mb-10">
`;

    const formContentStart = originalForm.indexOf('<form');
    if (formContentStart !== -1) {
        let fieldsContent = originalForm.slice(formContentStart);
        const formTagEnd = fieldsContent.lastIndexOf('</form>');
        fieldsContent = fieldsContent.substring(0, formTagEnd + 7);
        
        modalForm += fieldsContent + `
            </div>
        </div>
    </div>,
    document.body
)}
`;
        content = content.substring(0, formStart) + modalForm + '\n\n' + content.substring(formEndIdx);
    }
}

fs.writeFileSync(path, content);
console.log('Patched FacultyAssignments.jsx with createPortal Modal');
