const fs = require('fs');
let p = 'src/ERP/components/Student/Mentorship/Mentorship.jsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Upgrade Mentor Profile Card
const oldCard = `<div className="w-full lg:w-1/3 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-[2rem] p-6 lg:p-8 flex flex-col items-center text-center h-fit">
                                <div className="w-24 h-24 rounded-full bg-white/5 border border-gray-300 dark:border-white/10 text-gray-400 dark:text-white/30 flex items-center justify-center text-3xl font-black mb-4">
                                    {mentorData.full_name.charAt(0)}
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">{mentorData.full_name}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mt-1">{mentorData.department}</p>
                                <p className="text-xs font-medium text-gray-500 dark:text-white/50 mt-4 flex items-center gap-2">
                                    <i className="fa-solid fa-envelope"></i> {mentorData.email}
                                </p>
                            </div>`;

const newCard = `<div className="w-full lg:w-1/3 bg-themeApp border border-themeBorder rounded-[2rem] p-6 lg:p-8 flex flex-col items-center text-center h-fit relative overflow-hidden group hover:border-themeAccent/50 transition-all duration-300 shadow-sm hover:shadow-md">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-themeAccent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-themeAccent/20 transition-all"></div>
                                <div className="relative w-28 h-28 mb-6">
                                    <div className="absolute inset-0 bg-themeAccent/10 rounded-full blur-xl animate-pulse"></div>
                                    <div className="relative w-full h-full rounded-full bg-themeElevated border-2 border-themeBorder shadow-lg text-themeTextSec flex items-center justify-center text-4xl font-black overflow-hidden ring-4 ring-themeApp">
                                        {mentorData.profile_picture_url ? (
                                            <img src={mentorData.profile_picture_url} alt={mentorData.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="bg-gradient-to-br from-themeText to-themeTextSec bg-clip-text text-transparent drop-shadow-sm">{mentorData.full_name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-themeApp rounded-full shadow-sm"></div>
                                </div>
                                <h3 className="text-2xl font-black tracking-tight text-themeText leading-tight">{mentorData.full_name}</h3>
                                <span className="mt-2 px-3 py-1 rounded-full bg-themeElevated border border-themeBorder text-[11px] font-black uppercase tracking-widest text-themeAccent shadow-sm">{mentorData.department || 'Mentorship Team'}</span>
                                <div className="w-full h-px bg-themeBorderStrong my-6"></div>
                                <a href={\`mailto:\${mentorData.email}\`} className="w-full py-3.5 rounded-xl bg-themeElevated border border-themeBorder text-themeText hover:bg-themeAccent hover:text-gray-900 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm group/btn">
                                    <i className="fa-solid fa-paper-plane group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform"></i> Message Mentor
                                </a>
                            </div>`;

c = c.replace(oldCard, newCard);

// 2. Upgrade Empty State
const oldEmpty = `<div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                                        <i className="fa-solid fa-mug-hot text-2xl text-gray-300 dark:text-white/20 mb-3"></i>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50">No sessions recorded yet.</p>
                                    </div>`;

const newEmpty = `<div className="w-full py-20 lg:py-24 flex flex-col items-center justify-center bg-themeApp border border-themeBorder border-dashed rounded-[2rem] text-center px-4 group hover:border-themeAccent/30 transition-colors cursor-pointer" onClick={() => setShowRequestModal(true)}>
                                        <div className="w-20 h-20 bg-themeElevated border border-themeBorder rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                            <i className="fa-solid fa-mug-hot text-3xl text-themeTextSec opacity-70 group-hover:text-themeAccent transition-colors"></i>
                                        </div>
                                        <h3 className="text-[17px] font-black tracking-tight text-themeText mb-1">No Mentorship Sessions</h3>
                                        <p className="text-xs font-bold text-themeTextSec opacity-70 max-w-sm mx-auto mb-6">You haven't had any sessions with your mentor yet. Booking a session is a great way to stay on track.</p>
                                        <button className="px-6 py-2.5 rounded-xl bg-themeElevated border border-themeBorder text-themeText hover:bg-themeAccent hover:text-gray-900 text-xs font-bold transition-all shadow-sm">
                                            Request First Session
                                        </button>
                                    </div>`;

c = c.replace(oldEmpty, newEmpty);

fs.writeFileSync(p, c);
console.log("Mentorship aesthetics upgraded");
