const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Mentorship/Mentorship.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<PageHeader[\s\S]*?\/>/;

const newHeader = `<div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-amber-500/5 via-transparent to-transparent py-8 shrink-0">
    <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4 lg:px-8">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl text-amber-500 shadow-sm">
                <i className="fa-solid fa-users-viewfinder"></i>
            </div>
            <div>
                <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">Mentorship & Guidance</h1>
                <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Connect with your assigned academic mentor</p>
            </div>
        </div>
    </div>
</div>`;

content = content.replace(regex, newHeader);

// Fix wrapper to allow edge-to-edge
content = content.replace(/<div className="w-full max-w-\[1800px\] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-10 lg:pb-10 xl:pb-8">/, '<div className="w-full max-w-[1800px] mx-auto flex flex-col pb-10 lg:pb-10 xl:pb-8">');

// Add padding to the content below the header
content = content.replace(/\{loading \? \(/, '<div className="flex flex-col p-4 lg:p-8 gap-6 lg:gap-8">\n{loading ? (');
content = content.replace(/<MentorshipChatHub[\s\S]*?\/>\s*\)\}\s*<\/div>\s*<\/div>/, '<MentorshipChatHub \n                        receiverId={mentorData.id}\n                        receiverName={mentorData.full_name}\n                        receiverRole="Mentor"\n                        receiverAvatar={mentorData.profile_picture_url}\n                    />\n                )}\n            </div>\n</div>\n        </div>');

fs.writeFileSync(file, content);
