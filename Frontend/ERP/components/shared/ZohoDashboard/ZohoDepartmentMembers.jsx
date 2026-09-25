/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React from 'react';

export default function ZohoDepartmentMembers({ title = "Department Members", members = [] }) {
    return (
        <div className="bg-[#18181A] rounded-xl border border-themeBorder dark:border-white/5 p-4 shadow-lg flex flex-col gap-4 max-h-[300px] overflow-y-auto no-scrollbar">
            <h4 className="text-themeTextSec text-xs font-semibold uppercase tracking-wider sticky top-0 bg-[#18181A] pb-2 z-10">
                {title}
            </h4>
            
            {members.length === 0 ? (
                <div className="text-themeText text-xs">No members found.</div>
            ) : (
                <div className="flex flex-col gap-4">
                    {members.map((member, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0">
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-themeText dark:text-white bg-purple-500">
                                        {member.name?.charAt(0) || 'M'}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-themeText text-xs font-medium truncate">{member.id} - {member.name}</span>
                                <span className={`text-[10px] mt-0.5 ${member.status === 'In' ? 'text-emerald-400' : 'text-[#FF453A]'}`}>
                                    {member.status === 'In' ? 'Checked In' : 'Out'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {members.length > 3 && (
                <button className="text-blue-400 text-xs font-medium text-left mt-2 hover:text-blue-300 transition-colors">
                    + {members.length - 3} More
                </button>
            )}
        </div>
    );
}
