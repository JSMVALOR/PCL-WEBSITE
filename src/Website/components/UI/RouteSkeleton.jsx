import React from 'react';

export default function RouteSkeleton() {
  return (
    <div className="w-full h-screen bg-[#f4f4f0] dark:bg-[#0a0a0a] flex flex-col pt-[80px]">
      {/* Navbar Skeleton Shell */}
      <div className="w-full h-[72px] lg:h-[84px] fixed top-0 left-0 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="w-32 h-8 bg-black/5 dark:bg-white/5 rounded-full animate-pulse"></div>
        <div className="hidden lg:flex gap-6">
            <div className="w-20 h-4 bg-black/5 dark:bg-white/5 rounded-full animate-pulse"></div>
            <div className="w-20 h-4 bg-black/5 dark:bg-white/5 rounded-full animate-pulse"></div>
            <div className="w-20 h-4 bg-black/5 dark:bg-white/5 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 py-12 flex flex-col gap-8">
        {/* Hero Section Skeleton */}
        <div className="w-full h-64 md:h-96 bg-black/5 dark:bg-white/5 rounded-3xl animate-pulse"></div>
        
        {/* Body Text Skeletons */}
        <div className="w-3/4 h-8 bg-black/5 dark:bg-white/5 rounded-full animate-pulse"></div>
        <div className="w-1/2 h-8 bg-black/5 dark:bg-white/5 rounded-full animate-pulse"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="w-full h-48 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse"></div>
            <div className="w-full h-48 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse"></div>
            <div className="w-full h-48 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
