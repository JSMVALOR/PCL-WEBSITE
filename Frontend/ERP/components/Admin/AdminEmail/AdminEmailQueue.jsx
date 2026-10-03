import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../shared/PageHeader/PageHeader';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

const ENGINE_URL = import.meta.env.DEV ? 'http://localhost:3001' : '/api';

export default function AdminEmailQueue() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'templates', 'contacts'

  // Queue State
  const [health, setHealth] = useState('LOADING'); // LOADING, OFFLINE, ONLINE
  const [stats, setStats] = useState({ sent: 0, failed: 0, pending: 0, lastFailureReason: null });
  const [logs, setLogs] = useState([]);
  const [sortOption, setSortOption] = useState('newest');

  // Contacts State
  const [contacts, setContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactFilter, setContactFilter] = useState('student');
  const [editingContactId, setEditingContactId] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', parent_email: '' });
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Templates State (Categorized)
  const templateCategories = [
    {
      category: "Authentication & Security",
      icon: "fa-shield-halved",
      color: "emerald",
      items: [
        { id: 'ERP_LOGIN_OTP', title: 'Student/Faculty Portal Login', desc: 'Secure OTP for standard portal access.' },
        { id: 'PARENT_LOGIN_OTP', title: 'Parent Portal Login', desc: 'Secure OTP email for parent dashboard login.' },
        { id: 'ADMIN_LOGIN_OTP', title: 'Admin Master Login', desc: 'Elevated authorization code for master dashboard.' },
        { id: 'RECOVERY_OTP', title: 'Account Recovery OTP', desc: 'Passcode reset and account recovery verification.' }
      ]
    },
    {
      category: "Finance & Billing",
      icon: "fa-indian-rupee-sign",
      color: "amber",
      items: [
        { id: 'FEE_INVOICE_RAISED', title: 'Fee Invoice Raised', desc: 'Send a new fee invoice with a payment link.' },
        { id: 'FEE_PAYMENT_CONFIRMED', title: 'Fee Payment Confirmed', desc: 'Send an official payment receipt for successful transactions.' }
      ]
    },
    {
      category: "Academic & Attendance",
      icon: "fa-graduation-cap",
      color: "blue",
      items: [
        { id: 'PARENT_ABSENT_ALERT', title: 'Attendance Alert', desc: 'Send an automated absence warning to parents.' }
      ]
    },
    {
      category: "Administration & Discipline",
      icon: "fa-gavel",
      color: "rose",
      items: [
        { id: 'GRIEVANCE_UPDATE', title: 'Grievance Status Update', desc: 'Notify students when their grievance status changes.' },
        { id: 'MEETING_CALL', title: 'Mandatory Meeting Call', desc: 'Summon a student for a disciplinary committee meeting.' }
      ]
    },
    {
      category: "Community & Events",
      icon: "fa-users",
      color: "purple",
      items: [
        { id: 'EVENT_REGISTRATION', title: 'Event Registration', desc: 'Confirm event registration or moot court entry.' },
        { id: 'BLOG_UPDATE', title: 'Blog Submission Update', desc: 'Notify authors about blog approval or rejection.' }
      ]
    }
  ];

  const fetchEmailStats = useCallback(async () => {
    if (activeTab !== 'queue') return;
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
  }, [activeTab]);

  useEffect(() => {
    fetchEmailStats();
    const interval = setInterval(fetchEmailStats, 5000);
    return () => clearInterval(interval);
  }, [fetchEmailStats]);

  const fetchContacts = useCallback(async () => {
    setIsLoadingContacts(true);
    try {
      let query = supabase.from('profiles').select('id, full_name, email, parent_email, role, academic_batch, erp_id');
      if (contactFilter) query = query.eq('role', contactFilter);
      const { data, error } = await query.order('full_name');
      if (!error && data) {
        setContacts(data);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoadingContacts(false);
  }, [contactFilter]);

  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts();
    }
  }, [activeTab, fetchContacts]);

  const handleSaveContact = async (id) => {
    setIsSavingContact(true);
    try {
      const { error } = await supabase.from('profiles').update({
        email: editForm.email,
        parent_email: editForm.parent_email
      }).eq('id', id);
      
      if (!error) {
        setContacts(prev => prev.map(c => c.id === id ? { ...c, ...editForm } : c));
        setEditingContactId(null);
        if (window.erpToast) window.erpToast.show("Contact updated successfully", "success");
      } else {
        if (window.erpToast) window.erpToast.show("Failed to update contact", "error");
      }
    } catch (e) {
      console.error(e);
    }
    setIsSavingContact(false);
  };

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
      <PageHeader 
        icon="fa-solid fa-envelope" 
        title="Email Broadcast Engine" 
        subtitle="Manage email templates, monitor SMTP health, and edit contact emails." 
        breadcrumbs={[
          { label: 'Communications Hub', onClick: () => { navigate('/admin/communications'); } },
          { label: 'Email Engine' }
        ]} 
      />

      <div className="px-4 lg:px-8 py-6 w-full mx-auto max-w-[1800px] animate-fade-in">
        
        {/* Tab Switcher */}
        <div className="flex bg-themeElevated p-1 rounded-xl w-fit flex-wrap gap-1 mb-6">
            <button onClick={() => setActiveTab('queue')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'queue' ? 'bg-themePanel text-blue-500 shadow-sm' : 'text-themeTextSec'}`}>Live Queue</button>
            <button onClick={() => setActiveTab('templates')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'templates' ? 'bg-themePanel text-purple-500 shadow-sm' : 'text-themeTextSec'}`}>Templates</button>
            <button onClick={() => setActiveTab('contacts')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'contacts' ? 'bg-themePanel text-cyan-500 shadow-sm' : 'text-themeTextSec'}`}>Contacts (Quick Edit)</button>
        </div>

        <div className="grid xl:grid-cols-12 gap-6">
          
          {/* QUEUE TAB */}
          {activeTab === 'queue' && (
            <>
              {/* Status Sidebar */}
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

              {/* Live Queue Table */}
              <div className="xl:col-span-8 flex flex-col gap-6">
                <div className="bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[2rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                  <div className="p-6 lg:p-8 border-b border-themeBorder flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-themeElevated/30">
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
            </>
          )}

          {/* TEMPLATES TAB */}
          {activeTab === 'templates' && (
            <div className="xl:col-span-12">
              <div className="bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[2rem] shadow-sm p-6 lg:p-8 min-h-[500px]">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-themeText flex items-center gap-3">
                    <i className="fa-solid fa-layer-group text-themeAccent"></i> System Email Templates
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-themeTextSec font-bold mt-2">Pre-configured HTML designs ready for dispatch</p>
                </div>
                
                <div className="flex flex-col gap-10">
                  {templateCategories.map((cat, index) => (
                    <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${cat.color}-500/10 text-${cat.color}-500 border border-${cat.color}-500/20`}>
                          <i className={`fa-solid ${cat.icon}`}></i>
                        </div>
                        <h4 className="text-lg font-black tracking-tight text-themeText">{cat.category}</h4>
                        <div className="flex-1 h-px bg-themeBorder/50 ml-4"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {cat.items.map(t => (
                          <div key={t.id} className={`bg-themeElevated/30 border border-themeBorder rounded-2xl p-5 hover:border-${cat.color}-500/50 transition-all hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-${cat.color}-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-${cat.color}-500/10 transition-colors`}></div>
                            <div className="relative z-10">
                              <h5 className="font-bold text-themeText text-base mb-1.5">{t.title}</h5>
                              <p className="text-[13px] text-themeTextSec font-medium leading-relaxed mb-5">{t.desc}</p>
                              <div className="flex items-center justify-between mt-auto">
                                <span className={`text-[9px] font-black text-${cat.color}-500 bg-${cat.color}-500/10 border border-${cat.color}-500/20 px-2.5 py-1.5 rounded-md uppercase tracking-widest`}>
                                  <i className="fa-solid fa-code mr-1.5 opacity-50"></i>{t.id}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTACTS TAB (WITH QUICK EDIT) */}
          {activeTab === 'contacts' && (
            <div className="xl:col-span-12">
              <div className="bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[2rem] shadow-sm flex flex-col min-h-[600px]">
                <div className="p-6 lg:p-8 border-b border-themeBorder flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-themeElevated/30">
                  <div>
                    <h3 className="text-lg font-bold text-themeText flex items-center gap-3">
                      <i className="fa-solid fa-address-book text-cyan-500"></i> Contacts Directory
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest text-themeTextSec font-bold mt-1">View and quick-edit email addresses</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <select value={contactFilter} onChange={e => setContactFilter(e.target.value)} className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-2 text-sm font-bold text-themeText outline-none">
                      <option value="student">Students</option>
                      <option value="faculty">Faculty</option>
                      <option value="parent">Parents</option>
                      <option value="admin">Admins</option>
                    </select>
                    <button onClick={fetchContacts} className="bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-4 py-2 rounded-xl text-sm font-bold hover:bg-cyan-500/20 transition-colors">
                      <i className="fa-solid fa-sync"></i>
                    </button>
                  </div>
                </div>

                <div className="p-4 lg:p-6 overflow-y-auto custom-scrollbar flex-1">
                  {isLoadingContacts ? (
                    <div className="text-center py-12">
                      <i className="fa-solid fa-circle-notch fa-spin text-3xl text-themeAccent mb-4"></i>
                      <p className="text-sm text-themeTextSec font-bold mt-4">Loading directory...</p>
                    </div>
                  ) : contacts.length === 0 ? (
                    <div className="text-center py-12 text-themeTextSec">
                      <i className="fa-solid fa-users-slash text-4xl mb-4 opacity-50"></i>
                      <p className="font-bold">No contacts found in this category.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {contacts.map(c => (
                        <div key={c.id} className="bg-themeElevated/20 border border-themeBorder rounded-2xl p-5 hover:border-cyan-500/50 transition-colors relative group">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-cyan-500/10 text-cyan-500 rounded-xl flex items-center justify-center font-black border border-cyan-500/20">
                                {c.full_name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <h4 className="font-bold text-themeText text-sm truncate max-w-[150px]">{c.full_name}</h4>
                                <span className="text-[9px] font-black text-themeTextSec uppercase tracking-widest">{c.erp_id || c.role}</span>
                              </div>
                            </div>
                            {editingContactId !== c.id && (
                              <button onClick={() => {
                                setEditingContactId(c.id);
                                setEditForm({ email: c.email || '', parent_email: c.parent_email || '' });
                              }} className="text-themeTextSec hover:text-cyan-500 p-1">
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                            )}
                          </div>

                          {editingContactId === c.id ? (
                            <div className="mt-4 flex flex-col gap-3 animate-fade-in bg-themeApp p-3 rounded-xl border border-themeBorder">
                              <div>
                                <label className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mb-1 block">Primary Email</label>
                                <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-lg px-3 py-1.5 text-xs text-themeText focus:border-cyan-500 outline-none" placeholder="student@example.com" />
                              </div>
                              {c.role === 'student' && (
                                <div>
                                  <label className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mb-1 block">Parent Email</label>
                                  <input type="email" value={editForm.parent_email} onChange={e => setEditForm({...editForm, parent_email: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-lg px-3 py-1.5 text-xs text-themeText focus:border-cyan-500 outline-none" placeholder="parent@example.com" />
                                </div>
                              )}
                              <div className="flex gap-2 mt-1">
                                <button onClick={() => setEditingContactId(null)} className="flex-1 bg-themeElevated text-themeTextSec text-[10px] font-bold py-1.5 rounded-lg hover:bg-themeBorder transition-colors">Cancel</button>
                                <button onClick={() => handleSaveContact(c.id)} disabled={isSavingContact} className="flex-1 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 text-[10px] font-bold py-1.5 rounded-lg hover:bg-cyan-500/20 transition-colors disabled:opacity-50">
                                  {isSavingContact ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 flex flex-col gap-2">
                              {c.email ? (
                                <div className="text-xs font-medium text-themeText truncate flex items-center gap-2">
                                  <i className="fa-solid fa-envelope text-themeTextSec/50 w-3"></i> {c.email}
                                </div>
                              ) : (
                                <div className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded w-fit">No Primary Email</div>
                              )}
                              {c.role === 'student' && (
                                c.parent_email ? (
                                  <div className="text-xs font-medium text-themeText truncate flex items-center gap-2">
                                    <i className="fa-solid fa-user-shield text-themeTextSec/50 w-3"></i> {c.parent_email}
                                  </div>
                                ) : (
                                  <div className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded w-fit">No Parent Email</div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
