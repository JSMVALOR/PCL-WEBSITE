/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React from 'react';

export default function ZohoReportingCard({ mode = "reporting", users = [] }) {
    return (
        <div className="bg-[#18181A] rounded-xl border border-themeBorder dark:border-white/5 p-4 shadow-lg flex flex-col gap-3">
            <h4 className="text-themeTextSec text-xs font-semibold uppercase tracking-wider mb-1">
                {mode === 'reporting' ? 'Reporting To' : 'Mentoring'}
            </h4>
            
            {users.length === 0 ? (
                <div className="text-themeText text-xs">No assignments found.</div>
            ) : (
                users.map((user, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-themeText dark:text-white bg-blue-500">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-themeText text-xs font-medium truncate">{user.id} - {user.name}</span>
                            <span className="text-[#FF453A] text-[10px] mt-0.5">Out</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
