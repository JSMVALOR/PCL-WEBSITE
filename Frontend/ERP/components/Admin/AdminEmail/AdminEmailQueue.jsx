import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../shared/PageHeader/PageHeader';

const ENGINE_URL = import.meta.env.DEV ? 'http://localhost:3001' : '/api';

export default function AdminEmailQueue() {
  const [health, setHealth] = useState('LOADING'); // LOADING, OFFLINE, ONLINE
  const [stats, setStats] = useState({ sent: 0, failed: 0, pending: 0, lastFailureReason: null });
  const [logs, setLogs] = useState([]);
  const [sortOption, setSortOption] = useState('newest');

  const fetchEmailStats = useCallback(async () => {
    try {
      const res = await fetch(`${ENGINE_URL}/api/email/stats`);
      if (res.ok) {
        const data = await res.json();
        setHealth(data.health);
        setStats(data.stats);
        setLogs(data.logs);
      } else {
        setHealth('OFFLINE');
      }
    } catch (e) {
      setHealth('OFFLINE');
    }
  }, []);

  useEffect(() => {
    fetchEmailStats();
    const interval = setInterval(fetchEmailStats, 5000);
    return () => clearInterval(interval);
  }, [fetchEmailStats]);

  const sortedLogs = [...logs].sort((a, b) => {
    if (sortOption === 'oldest') return new Date(a.time) - new Date(b.time);
    if (sortOption === 'status') {
      const order = { 'FAILED': 0, 'SENT': 1 };
      return (order[a.status] || 2) - (order[b.status] || 2);
    }
    return new Date(b.time) - new Date(a.time); // newest
  });

  return (
    <div className="min-h-screen bg-themeApp text-themeText pb-20">
      <PageHeader icon="fa-solid fa-envelope" title="Email Broadcast Engine" subtitle="Live SMTP connection and outbound email delivery status." />

      <div className="px-4 lg:px-8 py-6 w-full mx-auto max-w-7xl animate-fade-in">
        <div className="grid xl:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR: Status & Stats */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[2rem] p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-24 h-24 bg-themeElevated/50 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-themeBorder/50">
                <i className={`fa-solid fa-envelope text-4xl ${health === 'ONLINE' ? 'text-blue-500' : 'text-rose-500'}`}></i>
              </div>
              <h3 className="text-xl font-black text-themeText mb-2">SMTP Connection</h3>
              
              <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-6 flex items-center gap-2 ${health === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : health === 'LOADING' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                {health === 'ONLINE' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                {health === 'LOADING' && <i className="fa-solid fa-circle-notch fa-spin"></i>}
                {health === 'OFFLINE' && <i className="fa-solid fa-triangle-exclamation"></i>}
                SMTP {health}
              </div>

              <p className="text-sm font-medium text-themeTextSec px-4 leading-relaxed">
                The engine uses NodeMailer connected to the internal Mail Service for sending broadcast emails and OTPs.
              </p>
            </div>

            <div className="bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[2rem] p-6 shadow-sm">
              <h4 className="text-sm font-bold text-themeTextSec uppercase tracking-widest mb-4">Delivery Metrics</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center p-4 bg-themeElevated/30 rounded-xl border border-themeBorder/50">
                  <div className="text-3xl font-black text-emerald-500">{stats.sent}</div>
                  <div className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Delivered</div>
                </div>
                <div className="text-center p-4 bg-themeElevated/30 rounded-xl border border-themeBorder/50">
                  <div className="text-3xl font-black text-rose-500">{stats.failed}</div>
                  <div className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Failed</div>
                </div>
              </div>
              {stats.lastFailureReason && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl mt-3">
                  <p className="text-[10px] font-black uppercase text-rose-500 mb-1">Last Failure Reason</p>
                  <p className="text-xs font-bold text-themeText truncate" title={stats.lastFailureReason}>{stats.lastFailureReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: Live Queue */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="flex bg-themeElevated p-1 rounded-xl w-fit flex-wrap gap-1">
                <button className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all bg-themePanel text-blue-500 shadow-sm`}>Live Email Logs</button>
            </div>

            <div className="bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[2rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              
              <div className="p-6 lg:p-8 border-b border-themeBorder flex justify-between items-center bg-themeElevated/30">
                <div>
                  <h3 className="text-lg font-bold text-themeText flex items-center gap-3">
                    <i className="fa-solid fa-list-check text-themeAccent"></i> Recent Dispatches
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-themeTextSec font-bold mt-1">Live Telemetry • Refreshes every 5s</p>
                </div>
                <div className="flex items-center gap-2">
                   <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="bg-themeElevated border border-themeBorder text-themeText px-3 py-1.5 rounded-lg text-xs font-bold focus:outline-none appearance-none cursor-pointer hover:bg-themeBorder/50 transition-colors hidden sm:block">
                      <option value="newest">Sort: Newest</option>
                      <option value="oldest">Sort: Oldest</option>
                      <option value="status">Sort: Status</option>
                   </select>
                </div>
              </div>
              
              <div className="overflow-x-auto flex-1 p-2 lg:p-4 custom-scrollbar">
                <table className="w-full text-left border-collapse block md:table">
                  <thead className="hidden md:table-header-group">
                    <tr className="border-b border-themeBorder">
                      <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-themeTextSec">Time</th>
                      <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-themeTextSec">Recipient</th>
                      <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-themeTextSec">Subject</th>
                      <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-themeTextSec text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-themeBorder">
                    {sortedLogs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-12 text-center flex flex-col items-center justify-center">
                          <i className="fa-regular fa-envelope-open text-4xl text-themeTextSec/30 mb-3"></i>
                          <span className="text-themeTextSec font-bold text-sm">No recent emails in session</span>
                        </td>
                      </tr>
                    ) : sortedLogs.map(item => (
                      <tr key={item.id} className="block md:table-row border-b md:border-none border-themeBorder/50 hover:bg-themeElevated/20 transition-colors p-4 md:p-0">
                        <td className="block md:table-cell px-2 py-1 md:px-6 md:py-4">
                          <span className="text-xs font-bold text-themeTextSec whitespace-nowrap">
                            {new Date(item.time).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="block md:table-cell px-2 py-1 md:px-6 md:py-4">
                          <span className="text-sm font-bold text-themeText">
                            {item.to}
                          </span>
                        </td>
                        <td className="block md:table-cell px-2 py-1 md:px-6 md:py-4">
                           <span className="text-sm font-medium text-themeTextSec truncate max-w-[200px] block">
                             {item.subject}
                           </span>
                           {item.error && (
                             <span className="text-[10px] font-bold text-rose-500 mt-1 block">Error: {item.error}</span>
                           )}
                        </td>
                        <td className="block md:table-cell px-2 py-1 md:px-6 md:py-4 md:text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            item.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                            'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}>
                            {item.status === 'SENT' ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-xmark"></i>}
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
