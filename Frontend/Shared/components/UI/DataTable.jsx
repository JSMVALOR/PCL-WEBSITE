/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';

/**
 * Reusable Data Table Component
 * @param {Array} columns - Array of objects: { key, label, render (optional func) }
 * @param {Array} data - Array of row objects
 * @param {boolean} isLoading - Loading state
 * @param {string} emptyMessage - Message to show when data is empty
 */
export default function DataTable({ columns, data, isLoading, emptyMessage = "No records found" }) {
  if (isLoading) {
    return (
      <div className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-themeBorder p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-themeAccent/20 border-t-themeAccent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-themeTextSec">Loading records...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-themeBorder p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-themeElevated flex items-center justify-center mb-4">
          <i className="fa-solid fa-folder-open text-2xl text-themeTextSec"></i>
        </div>
        <h2 className="text-xl font-black text-themeText mb-2">{emptyMessage}</h2>
      </div>
    );
  }

  return (
    <div className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-themeBorder rounded-[2rem] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-themeElevated border-b border-themeBorder">
              {columns.map((col, idx) => (
                <th key={col.key || idx} className="p-4 text-xs font-black text-themeTextSec uppercase tracking-wider whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-themeBorder/50">
            {data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-themeElevated/50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={col.key || colIndex} className="p-4 text-sm text-themeText whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
