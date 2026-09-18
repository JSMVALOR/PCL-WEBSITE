import React from 'react';
import { useERP } from '../../../context/ErpContext';
import ZohoProfileCard from './ZohoProfileCard';
import ZohoReportingCard from './ZohoReportingCard';
import ZohoDepartmentMembers from './ZohoDepartmentMembers';
import ZohoMainContent from './ZohoMainContent';
import bannerImg from '../../../../Shared/Assets/CAMPUS/PCL_CAMPUS.webp';

export default function ZohoLayout({ 
    roleLabel = "User", 
    reportingMode = "reporting", 
    reportingUsers = [], 
    departmentMembers = [],
    role = "student",
    children
}) {
    const { userSession } = useERP();

    return (
        <div className="w-full min-h-screen bg-[#050505] font-sans selection:bg-blue-500/30">
            {/* Top Banner with Leafy/Campus Image */}
            <div className="w-full h-[320px] relative">
                <div className="absolute inset-0">
                    <img src={bannerImg} alt="Banner" className="w-full h-full object-cover opacity-60 saturate-[1.2]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]"></div>
                </div>
                
                {/* Top Nav Tabs - Aligned to match the Right Content grid */}
                <div className="absolute top-10 left-0 w-full px-4 md:px-8 xl:px-12 z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="hidden lg:block lg:col-span-3 xl:col-span-2"></div>
                        <div className="lg:col-span-9 xl:col-span-10 flex items-center gap-10">
                            <h1 className="text-gray-900 dark:text-white font-bold text-[32px] tracking-tight drop-shadow-2xl">My Space</h1>
                            <div className="hidden md:flex gap-8 mt-2">
                                <button className="text-gray-900 dark:text-white text-[15px] font-semibold border-b-2 border-blue-500 pb-1">Overview</button>
                                <button className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white transition-colors text-[15px] font-medium pb-1">Dashboard</button>
                                <button className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white transition-colors text-[15px] font-medium pb-1">Calendar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid - FULL SCREEN WIDTH */}
            <div className="w-full px-4 md:px-8 xl:px-12 pb-24 -mt-[140px] relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Sidebar (3 Cols) */}
                    <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-6">
                        <ZohoProfileCard session={userSession} roleLabel={roleLabel} />
                        
                        {reportingUsers && reportingUsers.length > 0 && (
                            <ZohoReportingCard mode={reportingMode} users={reportingUsers} />
                        )}
                        
                        {departmentMembers && departmentMembers.length > 0 && (
                            <ZohoDepartmentMembers members={departmentMembers} />
                        )}
                    </div>

                    {/* Right Content (9 Cols) */}
                    <div className="lg:col-span-9 xl:col-span-10 flex flex-col gap-6 pt-4">
                        {children || <ZohoMainContent session={userSession} role={role} />}
                    </div>

                </div>
            </div>
        </div>
    );
}
