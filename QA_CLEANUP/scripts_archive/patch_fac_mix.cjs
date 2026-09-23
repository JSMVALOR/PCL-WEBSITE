const fs = require('fs');
const path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { QRCodeSVG }')) {
    content = content.replace("import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';", "import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';\nimport { QRCodeSVG } from 'qrcode.react';");
}

// Add state for Live QR
if (!content.includes('showQR')) {
    content = content.replace('const [activeSession, setActiveSession] = useState(null);', 'const [activeSession, setActiveSession] = useState(null);\n    const [showQR, setShowQR] = useState(false);\n    const [qrCodeData, setQrCodeData] = useState(null);');
}

// Generate QR function
const generateQRFunc = `
    const generateLiveQR = () => {
        if (!activeSession) return;
        const token = \`jsmerp_att_\${Math.random().toString(36).substring(2, 15)}\`;
        setQrCodeData({
            sessionToken: token,
            subject: activeSession.classData?.subject?.name || "Unknown",
            batch: activeSession.classData?.batch || "",
            expiresIn: 300
        });
        setShowQR(true);
    };
`;

if (!content.includes('generateLiveQR')) {
    content = content.replace('const generateQR = async () => {', generateQRFunc + '\n\n    const generateQR = async () => {');
}

// Add Live QR Button next to "Generate Live OTP"
const otpBtn = `<button type="button" onClick={generateQR} disabled={activeSession.status === 'completed'} className={\`w-full py-4 rounded-xl text-[14px] font-bold tracking-tight transition-all active:scale-[0.98] relative z-10 \${activeSession.status === 'completed' ? 'bg-black/5 dark:bg-white/5 text-gray-400 cursor-not-allowed' : 'bg-[#AF52DE] hover:bg-[#9B49C4] text-white shadow-lg shadow-[#AF52DE]/20'}\`}>
 Generate Live OTP
 </button>`;

const mixedBtns = `<div className="flex gap-2">
    <button type="button" onClick={generateQR} disabled={activeSession.status === 'completed'} className={\`flex-1 py-4 rounded-xl text-[13px] lg:text-[14px] font-bold tracking-tight transition-all active:scale-[0.98] relative z-10 \${activeSession.status === 'completed' ? 'bg-black/5 dark:bg-white/5 text-gray-400 cursor-not-allowed' : 'bg-[#AF52DE] hover:bg-[#9B49C4] text-white shadow-lg shadow-[#AF52DE]/20'}\`}>
        Generate Live OTP
    </button>
    <button type="button" onClick={generateLiveQR} disabled={activeSession.status === 'completed'} className={\`flex-1 py-4 rounded-xl text-[13px] lg:text-[14px] font-bold tracking-tight transition-all active:scale-[0.98] relative z-10 \${activeSession.status === 'completed' ? 'bg-black/5 dark:bg-white/5 text-gray-400 cursor-not-allowed' : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1C1C1E] dark:text-[#F2F2F7] shadow-lg shadow-black/5'}\`}>
        <i className="fa-solid fa-qrcode mr-2"></i> Live QR
    </button>
</div>`;

content = content.replace(otpBtn, mixedBtns);

// Inject QR Modal
const qrModal = `
{showQR && qrCodeData && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-md p-4 animate-fade-in no-print">
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#121212] border border-[#2a2a2a] p-10 rounded-2xl flex flex-col items-center max-w-lg w-full relative">
            <button type="button" onClick={() => setShowQR(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-[#888888] hover:text-white bg-[#222222] rounded-full border border-white/5 transition-colors hover:scale-110">
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>
            <div className="text-center mb-10">
                <h3 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">{qrCodeData.subject}</h3>
                <p className="text-emerald-500 font-bold tracking-widest uppercase text-sm">Official Roster Scan</p>
                <div className="inline-block mt-4 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/70 text-xs font-semibold">
                    Expires in {Math.floor(qrCodeData.expiresIn / 60)}:{(qrCodeData.expiresIn % 60).toString().padStart(2, '0')}
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-[0_0_60px_rgba(255,255,255,0.1)] relative">
                <QRCodeSVG value={JSON.stringify(qrCodeData)} size={280} level="H" includeMargin={false} />
            </div>
            <p className="mt-10 text-white/50 text-sm font-medium tracking-wide text-center">
                Students: Scan this code using the PCL Mobile App to instantly register your presence.
            </p>
        </div>
    </div>
)}
`;

if (!content.includes('qrCodeData &&')) {
    content = content.replace('{activeTab === \'analytics\' &&', qrModal + '\n{activeTab === \'analytics\' &&');
}

fs.writeFileSync(path, content);
console.log("Patched Live QR into FacultyAttendance");
