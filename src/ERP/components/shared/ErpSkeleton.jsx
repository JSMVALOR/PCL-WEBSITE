import React from 'react';

export default function ErpSkeleton() {
  return (
    <div className="w-full h-screen bg-themeApp flex flex-col pt-[72px] lg:pt-[84px] px-4 lg:px-6">
      {/* TopNav Skeleton Shell */}
      <div className="w-full h-[72px] lg:h-[84px] fixed top-0 left-0 border-b border-themeBorder bg-themePanel/50 backdrop-blur-md z-50 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-themeBorder rounded-xl animate-pulse"></div>
            <div className="w-32 h-6 bg-themeBorder rounded-full animate-pulse hidden md:block"></div>
        </div>
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-themeBorder rounded-full animate-pulse"></div>
            <div className="w-8 h-8 bg-themeBorder rounded-full animate-pulse"></div>
            <div className="w-10 h-10 bg-themeBorder rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Dashboard Body Skeleton */}
      <div className="flex-1 w-full max-w-7xl mx-auto py-6 flex flex-col gap-6 w-full">
        <div className="flex gap-4 mb-4">
            <div className="w-1/3 h-10 bg-themeBorder rounded-xl animate-pulse"></div>
            <div className="w-1/4 h-10 bg-themeBorder rounded-xl animate-pulse hidden md:block"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 h-64 bg-themePanel border border-themeBorder rounded-themePanel animate-pulse"></div>
            <div className="col-span-1 h-64 bg-themePanel border border-themeBorder rounded-themePanel animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-32 bg-themePanel border border-themeBorder rounded-themePanel animate-pulse"></div>
            <div className="h-32 bg-themePanel border border-themeBorder rounded-themePanel animate-pulse"></div>
            <div className="h-32 bg-themePanel border border-themeBorder rounded-themePanel animate-pulse"></div>
            <div className="h-32 bg-themePanel border border-themeBorder rounded-themePanel animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
