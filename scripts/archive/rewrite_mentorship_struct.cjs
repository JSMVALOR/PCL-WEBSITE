const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Mentorship/Mentorship.jsx';
let content = fs.readFileSync(file, 'utf8');

// I'll grab from `return (` to `{loading ? (` and replace it completely to ensure valid tags.
const regex = /return \([\s\S]*?\{loading \? \(/;

const newStruct = `return (
        <div className="w-full min-h-screen bg-transparent text-themeText dark:text-white font-sans animate-fade-in">
            <div className="w-full mx-auto flex flex-col">
                {/* Header Banner */}
                <div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-amber-500/5 via-transparent to-transparent py-8 shrink-0">
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
                </div>

                <div className="w-full max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8 pb-12">
                    {loading ? (`;

content = content.replace(regex, newStruct);

// Then fix the bottom divs. Currently they are:
/*
                {mentorData?.id && (
                    <MentorshipChatHub 
...
                    />
                )}
            </div>
</div>
        </div>
    );
*/
// It should be 3 divs closing.
const bottomRegex = /\{mentorData\?\.id && \([\s\S]*?\/>\n                \)\}\n            <\/div>\n<\/div>\n        <\/div>\n    \);\n\}/;
const newBottom = `{mentorData?.id && (
                    <MentorshipChatHub 
                        receiverId={mentorData.id}
                        receiverName={mentorData.full_name}
                        receiverRole="Mentor"
                        receiverAvatar={mentorData.profile_picture_url}
                    />
                )}
                </div>
            </div>
        </div>
    );
}`;

content = content.replace(bottomRegex, newBottom);

fs.writeFileSync(file, content);
