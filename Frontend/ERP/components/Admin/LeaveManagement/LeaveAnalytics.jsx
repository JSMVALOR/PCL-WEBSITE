import React from 'react';

export default function LeaveAnalytics() {
    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 backdrop-blur-3xl min-h-[200px] flex flex-col">
                    <h3 className="font-serif text-xl text-themeText dark:text-white mb-auto">Leave by Department (This Year)</h3>
                    <p className="text-sm italic text-themeTextSec dark:text-white/40 mt-8">No department data available.</p>
                </div>
                
                <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 backdrop-blur-3xl min-h-[200px] flex flex-col">
                    <h3 className="font-serif text-xl text-themeText dark:text-white mb-auto">Leave Reasons Breakdown</h3>
                    <p className="text-sm italic text-themeTextSec dark:text-white/40 mt-8">No leave requests available.</p>
                </div>
            </div>

            <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 backdrop-blur-3xl min-h-[400px] flex flex-col">
                <div className="flex justify-between items-start mb-auto">
                    <h3 className="font-serif text-xl text-themeText dark:text-white">Peak Leave Periods</h3>
                    <button className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400">EXPORT REPORT</button>
                </div>
                
                <div className="w-full mt-20 border-b border-black/10 dark:border-white/10 relative">
                    <div className="absolute w-full flex justify-between bottom-0 translate-y-full pt-4 px-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
