/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';

export default function StatCard({ title, value, badgeText, badgeColor = "emerald" }) {
  const colorMap = {
    emerald: "text-emerald-500 bg-emerald-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    indigo: "text-indigo-500 bg-indigo-500/10",
    rose: "text-rose-500 bg-rose-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    gray: "text-gray-500 bg-gray-500/10"
  };

  const badgeClass = colorMap[badgeColor] || colorMap.emerald;

  return (
    <div className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-themeBorder p-6 rounded-[2rem] shadow-sm flex flex-col gap-4">
      <h3 className="text-sm font-black tracking-tight text-themeTextSec uppercase">{title}</h3>
      <div className="text-4xl font-black text-themeText">{value}</div>
      {badgeText && (
        <p className={`text-[11px] font-bold w-fit px-2 py-0.5 rounded-md ${badgeClass}`}>
          {badgeText}
        </p>
      )}
    </div>
  );
}
