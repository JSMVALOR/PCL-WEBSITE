/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
"use client";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { Badge } from "../../ui/Badge";

import React, { useState, useEffect } from "react";
import { sendSystemEmail } from '../../../lib/EmailService';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { theme } from '../../../../Shared/theme';
import { createClient } from '@supabase/supabase-js';
import AdminFacultyEditorModal from "../AdminFacultyDirectory/AdminFacultyEditorModal";
import AdminStudentCVModal from './AdminStudentCVModal';
import AdminUserEditorModal from './AdminUserEditorModal';
import AdminUserProfileModal from './AdminUserProfileModal';
import AdminPasswordResetsModal from './AdminPasswordResetsModal';

// Safe provisioning client so admin doesn't get logged out
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ;
const provisionClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
 auth: { persistSession: false, autoRefreshToken: false }
});

const CACHE_KEY = 'admin_user_directory';

export default function UserManagement({ isHubView = false, isEmbedded = false }) {
 const [activeTab, setActiveTab] = useState("students"); // 'students', 'faculty', 'disciplinary'
 const [showProvisionModal, setShowProvisionModal] = useState(false);
 const [isProvisioning, setIsProvisioning] = useState(false);
 const [provisionSuccess, setProvisionSuccess] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [sortBy, setSortBy] = useState("name_asc"); // name_asc, name_desc, id_asc, id_desc, status

 const [selectedQuestionnaireUser, setSelectedQuestionnaireUser] = useState(null);
    const [editBasicUserId, setEditBasicUserId] = useState(null);
  const [editFacultyId, setEditFacultyId] = useState(null);
 const [qFormData, setQFormData] = useState({});

 // Profile Modal State
 const [selectedProfileUser, setSelectedProfileUser] = useState(null);
 const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

 // Provisioning Form State
 const [newUserRole, setNewUserRole] = useState("student");
 const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
 const [assignment, setAssignment] = useState("");
 const [provisionLogs, setProvisionLogs] = useState([]);
 
 // Feature state
 const [showPasswordResetsModal, setShowPasswordResetsModal] = useState(false);

 // Actual Data
 const [usersData, setUsersData] = useState(() => {
 if (typeof window !== "undefined") {
 try {
 const cached = sessionStorage.getItem(CACHE_KEY);
 if (cached) {
 const parsed = JSON.parse(cached);
 if (parsed && parsed.students && parsed.faculty) return parsed;
 }
 } catch (e) { console.error("Cache parse error", e); }
 }
 return { students: [], faculty: [], disciplinary: [] };
 });
 const [isLoading, setIsLoading] = useState(!sessionStorage.getItem(CACHE_KEY));
 const [cvStudentId, setCvStudentId] = useState(null);

 // --- DATA FETCHER ---
 const fetchDirectory = async () => {
 try {
 const { data: profiles, error } = await supabase.from('profiles').select('*').limit(1500);
 if (error) throw error;

 const structuredData = { students: [], faculty: [], disciplinary: [] };

 profiles.forEach(p => {
 const mapped = {
 db_id: p.id,
 id: p.erp_id,
 name: p.full_name,
 batch: p.academic_batch,
 department: p.department,
 email: p.email,
 status: p.status || 'Active',
 questionnaire_data: p.questionnaire_data
 };

 if (mapped.status === 'Suspended') {
 structuredData.disciplinary.push(mapped);
 }

 if (p.role === 'student') {
 structuredData.students.push(mapped);
 } else if (p.role === 'faculty') {
 structuredData.faculty.push(mapped);
 }
 });

 setUsersData(structuredData);
 if (typeof window !== "undefined") {
 sessionStorage.setItem(CACHE_KEY, JSON.stringify(structuredData));
 }
 } catch (error) {
 console.error("Failed to fetch directory:", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchDirectory();
 }, []);

 // --- ADMIN ACTIONS ---
 const handleToggleStatus = async (user) => {
 const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
 const confirmMsg = newStatus === 'Suspended' 
 ? `Are you sure you want to suspend ${user.name}? They will lose access to the portal.`
 : `Reactivate account for ${user.name}?`;
 
 if (!(await window.erpDialog.confirm(confirmMsg))) return;

 try {
 // Optimistic update
 const updatedUsers = { ...usersData };
 const list = user.batch ? updatedUsers.students : updatedUsers.faculty;
 const index = list.findIndex(u => u.db_id === user.db_id);
 if (index !== -1) list[index].status = newStatus;
 
 if (newStatus === 'Suspended') {
 updatedUsers.disciplinary.push({...list[index], status: newStatus});
 } else {
 updatedUsers.disciplinary = updatedUsers.disciplinary.filter(u => u.db_id !== user.db_id);
 }

 setUsersData(updatedUsers);

 const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', user.db_id);
      if (error) {
        fetchDirectory(); // revert
        throw error;
      }
      
      // Dispatch email
      try {
        if (newStatus === 'Suspended') {
            await sendSystemEmail('ACCOUNT_LOCKED', { to_email: user.email, name: user.name });
        } else {
            await sendSystemEmail('ACCOUNT_REACTIVATED', { to_email: user.email, name: user.name });
        }
      } catch (err) {
        console.error("Failed to send status email", err);
      }

 } catch (error) {
 window.erpDialog.alert("Failed to update status: " + error.message);
 }
 };

 const handleResetPassword = async (user) => {
    if (!(await window.erpDialog.confirm(`Generate and email a new temporary passcode for ${user.name} (${user.email})?`))) return;
    try {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
      let newPass = "Pcl#";
      for (let i = 0; i < 6; i++) {
        newPass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const { error } = await provisionClient.auth.admin.updateUserById(user.db_id, { password: newPass });
      if (error) throw error;
      
      await sendSystemEmail('PASSCODE_RESET', { to_email: user.email, name: user.name, password: newPass, erp_id: user.id });
      window.erpDialog.alert("New temporary passcode sent to " + user.email);
    } catch (error) {
      window.erpDialog.alert("Failed to reset passcode: " + error.message);
    }
  };

 // --- PROVISIONING LOGIC ---
 
  const handleSaveQuestionnaire = async () => {
    try {
      const { error } = await supabase.from('profiles').update({
        questionnaire_data: qFormData
      }).eq('id', selectedQuestionnaireUser.db_id);
      
      if (error) throw error;
      window.erpDialog.alert("Questionnaire data updated successfully.");
      setSelectedQuestionnaireUser(null);
      fetchDirectory();
    } catch (error) {
      window.erpDialog.alert("Failed to update questionnaire: " + error.message);
    }
  };

  const handleTriggerQuestionnaire = async () => {
    try {
      const { error } = await supabase.from('profiles').update({
        questionnaire_completed: false
      }).eq('id', selectedQuestionnaireUser.db_id);
      
      if (error) throw error;

      const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
      await supabase.from('notices').insert([{
        notice_id: noticeId,
        title: 'Action Required: Complete Profile Questionnaire',
        category: 'System Alert',
        target_audience: 'person',
        target_id: selectedQuestionnaireUser.db_id,
        priority: 'high',
        content: `Your profile questionnaire is missing critical information. Please complete it immediately to ensure your records are up to date.`,
        author_name: 'Admin',
        author_id: null
      }]);

      window.erpDialog.alert(`Questionnaire triggered. A high-priority system alert has been sent to ${selectedQuestionnaireUser.name}.`);
      setSelectedQuestionnaireUser(null);
      fetchDirectory();
    } catch (error) {
      window.erpDialog.alert("Failed to trigger questionnaire: " + error.message);
    }
  };

  const openProvisionWizard = () => {
 setNewUserRole("student");
 setNewUserName("");
    setNewUserEmail("");
 setAssignment("");
 setProvisionLogs([]);
 setShowProvisionModal(true);
 };

 const closeProvisionWizard = () => {
 setShowProvisionModal(false);
 };

 const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !assignment) return;

    setIsProvisioning(true);
    setProvisionLogs([]);

    let shortcut = "BBL";
    if (assignment.includes("BA LLB")) shortcut = "BAL";
    if (assignment.includes("LLB") && !assignment.includes("BA ")) shortcut = "LLB";
    
    // Extract starting year from string like "BBA LLB (2024-2029)"
    let yearPrefix = "26"; // Default
    const yearMatch = assignment.match(/\((\d{4})/);
    if (yearMatch && yearMatch[1]) {
        yearPrefix = yearMatch[1].substring(2); // "2024" -> "24"
    }

    try {
      const prefix = newUserRole === "student" ? `${yearPrefix}${shortcut}` : "FAC-";
      
      const { data: highestIdData } = await supabase
        .from('profiles')
        .select('erp_id')
        .ilike('erp_id', `${prefix}%`)
        .order('erp_id', { ascending: false })
        .limit(1);

      let nextNum = 1;
      if (highestIdData && highestIdData.length > 0 && highestIdData[0].erp_id) {
        const lastId = highestIdData[0].erp_id;
        const numPart = lastId.replace(prefix, '');
        const parsedNum = parseInt(numPart, 10);
        if (!isNaN(parsedNum)) nextNum = parsedNum + 1;
      }
      
      const generatedId = `${prefix}${nextNum.toString().padStart(4, '0')}`;
      
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
      let generatedPassword = "Jsm#";
      for (let i = 0; i < 6; i++) {
        generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      setProvisionLogs(prev => [...prev, `[INIT] Provisioning ${generatedId} for ${newUserEmail}...`]);

      const { data: authData, error: authError } = await provisionClient.auth.signUp({
        email: newUserEmail,
        password: generatedPassword,
        
        options: { data: { role: newUserRole, erp_id: generatedId, name: newUserName } }
      });

      if (authError) throw authError;

      const profilePayload = {
        id: authData.user.id,
        role: newUserRole,
        erp_id: generatedId,
        email: newUserEmail,
        full_name: newUserName,
        status: 'Active'
      };

      if (newUserRole === "student") {
        profilePayload.academic_batch = assignment;
      } else {
        profilePayload.department = assignment;
      }

      const { error: profileError } = await provisionClient.from('profiles').upsert([profilePayload]);
      if (profileError) throw profileError;

      setProvisionLogs(prev => [...prev, `[SUCCESS] Profile generated. Syncing with platforms...`]);

      // Website sync for faculty
      if (newUserRole === "faculty") {
         const { error: websiteError } = await provisionClient.from('faculty_profiles').upsert({
            id: authData.user.id,
            designation: "Assistant Professor",
            department: assignment,
            is_public: true
         });
         if (websiteError) {
             setProvisionLogs(prev => [...prev, `[WARNING] Website sync failed: ${websiteError.message}`]);
         } else {
             setProvisionLogs(prev => [...prev, `[SYNC] Added to public website faculty directory.`]);
         }
      }

      // Dispatch Email
      try {
        await sendSystemEmail('ONBOARDING', {
          to_email: newUserEmail,
          erp_id: generatedId,
          password: generatedPassword,
          name: newUserName
        });
        setProvisionLogs(prev => [...prev, `[EMAIL SUCCESS] Credentials securely dispatched to ${newUserEmail}`]);
      } catch (emailErr) {
         setProvisionLogs(prev => [...prev, `[WARNING] Email failed: ${emailErr.message}. Manual share required: ${generatedPassword}`]);
      }

      setIsProvisioning(false);
      setProvisionSuccess(true);
      fetchDirectory();

    } catch (err) {
      setProvisionLogs(prev => [...prev, `[ERROR] Pipeline aborted: ${err.message}`]);
      setIsProvisioning(false);
    }
};

  const getSortedFilteredList = () => {
    let list = [...(usersData[activeTab] || [])];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(u => 
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.id && u.id.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query))
      );
    }
    
    list.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return (a.name || '').localeCompare(b.name || '');
        case 'name_desc': return (b.name || '').localeCompare(a.name || '');
        case 'id_asc': return (a.id || '').localeCompare(b.id || '');
        case 'id_desc': return (b.id || '').localeCompare(a.id || '');
        case 'status': return (a.status || '').localeCompare(b.status || '');
        default: return 0;
      }
    });
    return list;
  };

 const currentList = getSortedFilteredList();

 return (
 <div className={`w-full animate-fade-in selection:bg-gray-100 dark:bg-[#1A1A1A] ${!isEmbedded ? "min-h-screen bg-themeApp text-gray-900 dark:text-white" : ""}`}>
 <div className={`w-full mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>

 {/* 1. MASTER HEADER */}
 {!isHubView && (
 <PageHeader icon="fa-solid fa-users-gear" title="User Access Management" subtitle="Provision accounts, manage roles, and maintain the college directory." rightContent={
<>
<div className="flex gap-3 w-full lg:w-auto">
 <button type="button"
 onClick={() => setShowPasswordResetsModal(true)}
 className="flex-1 lg:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-gray-900 dark:text-white rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition flex items-center justify-center gap-2 border border-white/30 backdrop-blur-md"
 >
 <i className="fa-solid fa-unlock-keyhole text-base"></i> Password Resets
 </button>
 <button type="button"
 onClick={() => setShowProvisionModal(true)}
 className="flex-1 lg:flex-none px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/20 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition flex items-center justify-center gap-2 "
 >
 <i className="fa-solid fa-user-plus text-base"></i> Rapid Provisioning
 </button>
 </div>
 </>
} />
 )}
 
 {/* FAB FOR HUB VIEW */}
 {isHubView && (
 <div className="flex justify-end mb-4">
 <button type="button"
 onClick={() => setShowProvisionModal(true)}
 className="bg-amber-500 hover:bg-amber-500Muted text-gray-900 dark:text-white px-6 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition flex justify-center items-center gap-2 border border-gray-200 dark:border-white/5Accent active:scale-[0.98]"
 >
 <i className="fa-solid fa-user-plus text-base"></i> Rapid Provisioning
 </button>
 </div>
 )}

 {/* 2. CONTROLS & DIRECTORY */}
 <div className="flex flex-col gap-4 lg:gap-6 animate-fade-in">

 {/* Top Controls: Tabs, Search, Sort */}
 <div className={`${theme.layout.panel} rounded-2xl p-4 lg:p-5 flex flex-col lg:flex-row justify-between items-center gap-4 border border-gray-200 dark:border-white/5`}>
 
 {/* Tabs */}
 <div className="flex p-1.5 bg-themeApp rounded-2xl border border-gray-200 dark:border-white/5 w-full lg:w-auto shrink-0">
 <button type="button"
 onClick={() => setActiveTab('students')}
 className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 rounded-lg text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 ${activeTab === 'students' ? "bg-gray-100 dark:bg-[#1A1A1A] text-amber-500 border border-gray-200 dark:border-white/5" : "text-gray-500 dark:text-white/50 opacity-70 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-[#1A1A1A]/50 border border-transparent"}`}
 >
 Students <span className="ml-2 px-1.5 py-0.5 bg-themeApp rounded-md text-[9px] text-gray-500 dark:text-white/50">{usersData.students.length}</span>
 </button>
 <button type="button"
 onClick={() => setActiveTab('faculty')}
 className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 rounded-lg text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 ${activeTab === 'faculty' ? "bg-gray-100 dark:bg-[#1A1A1A] text-amber-500 border border-gray-200 dark:border-white/5" : "text-gray-500 dark:text-white/50 opacity-70 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-[#1A1A1A]/50 border border-transparent"}`}
 >
 Faculty <span className="ml-2 px-1.5 py-0.5 bg-themeApp rounded-md text-[9px] text-gray-500 dark:text-white/50">{usersData.faculty.length}</span>
 </button>
 
 </div>

 <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
 {/* Search */}
 <div className="relative w-full sm:w-64 group">
 <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50 opacity-70 group-focus-within:text-amber-500 transition-colors text-sm"></i>
 <input
 type="text"
 placeholder="Search Name, ID, Email..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-themeApp border border-gray-200 dark:border-white/5 rounded-2xl pl-10 pr-4 py-3 text-xs lg:text-sm font-bold text-gray-900 dark:text-white focus:bg-gray-100 dark:bg-[#1A1A1A] focus:border-gray-200 dark:border-white/5Accent outline-none transition placeholder:text-neutral-600"
 />
 </div>

 {/* Sort */}
 <div className="relative w-full sm:w-48">
 <select 
 value={sortBy} 
 onChange={(e) => setSortBy(e.target.value)}
 className="w-full bg-themeApp border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3 text-xs lg:text-sm font-bold text-gray-900 dark:text-white focus:bg-gray-100 dark:bg-[#1A1A1A] focus:border-gray-200 dark:border-white/5Accent outline-none appearance-none cursor-pointer"
 >
 <option value="name_asc">Sort: Name (A-Z)</option>
 <option value="name_desc">Sort: Name (Z-A)</option>
 <option value="id_asc">Sort: ERP ID (Asc)</option>
 <option value="id_desc">Sort: ERP ID (Desc)</option>
 <option value="status">Sort: Status</option>
 </select>
 <i className="fa-solid fa-arrow-down-a-z absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50 opacity-70 pointer-events-none text-sm"></i>
 </div>
 </div>
 </div>

 {/* Data Grid / Mobile Cards */}
 <div className={`${theme.layout.panel} rounded-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 min-h-[400px]`}>
 
 {/* Desktop Table View */}
 <div className="hidden md:block overflow-x-auto no-scrollbar">
 <table className="w-full text-left border-collapse min-w-[800px]">
 <thead>
 <tr className="bg-themeApp border-b border-gray-200 dark:border-white/5">
 <th className={`p-4 lg:p-5 pl-5 lg:pl-6 text-[9px] lg:text-[10px] font-black text-[#8E8E93] tracking-normal w-12 lg:w-16`}>Status</th>
 <th className={`p-4 lg:p-5 text-[9px] lg:text-[10px] font-black text-[#8E8E93] tracking-normal`}>User Profile</th>
 <th className={`p-4 lg:p-5 text-[9px] lg:text-[10px] font-black text-[#8E8E93] tracking-normal`}>{activeTab === 'students' ? 'Curriculum / Batch' : 'Department'}</th>
 <th className={`p-4 lg:p-5 pr-5 lg:pr-6 text-[9px] lg:text-[10px] font-black text-[#8E8E93] tracking-normal text-right`}>Admin Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-themeBorder">
 {isLoading ? (
 <tr>
 <td colSpan="4" className="py-12 text-center text-gray-500 dark:text-white/50 opacity-70 font-bold text-sm">
 <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading directory...
 </td>
 </tr>
 ) : currentList.map((user, i) => (
 <tr key={i} className="hover:bg-themeApp transition-colors group">
 <td className="p-4 lg:p-5 pl-5 lg:pl-6">
 <div className={`w-3 h-3 rounded-full border-2 ${user.status === 'Active' ? 'bg-emerald-500 border-emerald-900' : 'bg-rose-500 border-rose-900'}`} title={user.status}></div>
 </td>
 <td className="p-4 lg:p-5">
 <div className="flex items-center gap-4 cursor-pointer group/profile" onClick={() => { setSelectedProfileUser(user); setIsProfileModalOpen(true); }}>
 {user.avatar_url ? (
 <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-2xl object-cover shrink-0 group-hover/profile:shadow-lg transition-shadow border border-gray-200 dark:border-white/5" />
 ) : (
 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border border-gray-200 dark:border-white/5 shrink-0 group-hover/profile:shadow-lg transition-shadow ${activeTab === 'students' ? 'bg-gray-100 dark:bg-[#1A1A1A] text-amber-500' : 'bg-gray-100 dark:bg-[#1A1A1A] text-blue-400'}`}>
 {user.name.charAt(0)}
 </div>
 )}
 <div className="min-w-0">
 <p className="text-[15px] font-semibold text-gray-900 dark:text-white group-hover/profile:text-amber-500 transition-colors truncate">{user.name}</p>
 <div className="flex items-center gap-2 mt-1">
 <span className={`text-[10px] font-bold text-[#8E8E93] tracking-normal shrink-0`}>{user.id}</span>
 <span className="w-1 h-1 bg-neutral-700 rounded-full shrink-0"></span>
 <span className={`text-[10px] font-medium text-amber-500/80 truncate`}>{user.email}</span>
 </div>
 </div>
 </div>
 </td>
 <td className="p-4 lg:p-5">
 <Badge variant="secondary">{user.batch || user.department || "Unassigned"}</Badge>
 </td>
 <td className="p-4 lg:p-5 pr-5 lg:pr-6">
 <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
 <button type="button" onClick={() => setEditBasicUserId(user)} className="w-8 h-8 rounded-lg bg-themeApp border border-gray-200 dark:border-white/5 hover:border-emerald-500 hover:text-emerald-400 text-gray-500 dark:text-white/50 flex items-center justify-center transition-colors" title="Edit Master Details">
 <i className="fa-solid fa-pen text-[10px]"></i>
 </button>
 {(user.role === 'faculty' || user.role === 'admin') && (
 <button type="button" onClick={() => setEditFacultyId(user.db_id)} className="w-8 h-8 rounded-lg bg-amber-500/10 border border-gray-200 dark:border-white/5Accent/30 hover:bg-amber-500/20 text-amber-500 flex items-center justify-center transition-colors" title="Edit Website Profile">
 <i className="fa-solid fa-globe text-[10px]"></i>
 </button>
 )}
 <button type="button" onClick={() => handleResetPassword(user)} className="w-8 h-8 rounded-lg bg-themeApp border border-gray-200 dark:border-white/5 hover:border-indigo-500 hover:text-amber-500 text-gray-500 dark:text-white/50 flex items-center justify-center transition-colors" title="Reset Password">
 <i className="fa-solid fa-key text-[10px]"></i>
 </button>
 <button type="button" onClick={() => handleToggleStatus(user)} className={`w-8 h-8 rounded-lg bg-themeApp border-gray-200 dark:border-white/5 flex items-center justify-center transition-colors ${user.status === 'Active' ? 'border-gray-200 dark:border-white/5 hover:border-rose-500 hover:text-rose-500 text-gray-500 dark:text-white/50' : 'border-rose-500/50 bg-rose-500/10 text-rose-500 hover:bg-emerald-500 hover:text-gray-900 dark:text-white hover:border-emerald-500'}`} title={user.status === 'Active' ? 'Suspend Account' : 'Reactivate'}>
 <i className={`fa-solid ${user.status === 'Active' ? 'fa-ban' : 'fa-rotate-left'} text-[10px]`}></i>
 </button>
 </div>
 </td>
 </tr>
 ))}
 {!isLoading && currentList.length === 0 && (
 <tr>
 <td colSpan="4" className="py-12 text-center text-gray-500 dark:text-white/50 opacity-70 font-bold text-sm">
 No users found matching your criteria.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {/* Mobile Card View */}
 <div className="md:hidden flex flex-col divide-y divide-themeBorder bg-themeApp">
 {isLoading ? (
 <div className="py-10 text-center text-gray-500 dark:text-white/50 opacity-70 font-bold text-xs">
 <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading directory...
 </div>
 ) : currentList.map((user, i) => (
 <div key={i} className="p-4 flex flex-col gap-4">
 <div className="flex items-start justify-between gap-3">
 <div className="flex items-center gap-3 min-w-0 cursor-pointer group/profile" onClick={() => { setSelectedProfileUser(user); setIsProfileModalOpen(true); }}>
 {user.avatar_url ? (
 <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-2xl object-cover shrink-0 group-hover/profile:shadow-lg transition-shadow border border-gray-200 dark:border-white/5" />
 ) : (
 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border border-gray-200 dark:border-white/5 shrink-0 group-hover/profile:shadow-lg transition-shadow ${activeTab === 'students' ? 'bg-gray-100 dark:bg-[#1A1A1A] text-amber-500' : 'bg-gray-100 dark:bg-[#1A1A1A] text-blue-400'}`}>
 {user.name.charAt(0)}
 </div>
 )}
 <div className="min-w-0">
 <p className="text-[15px] font-semibold text-gray-900 dark:text-white group-hover/profile:text-amber-500 transition-colors truncate">{user.name}</p>
 <div className="flex items-center gap-2 mt-0.5">
 <span className={`text-[10px] font-bold text-[#8E8E93] tracking-normal shrink-0`}>{user.id}</span>
 </div>
 </div>
 </div>
 <div className={`shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
 <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
 {user.status}
 </div>
 </div>
 
 <div className="flex items-center gap-2 text-xs font-medium text-amber-500/80 bg-gray-100 dark:bg-[#1A1A1A] p-2 rounded-lg border border-gray-200 dark:border-white/5 truncate">
 <i className="fa-solid fa-envelope text-gray-500 dark:text-white/50"></i> {user.email}
 </div>

 <div className="flex items-center justify-between mt-1">
 <Badge variant="secondary">{user.batch || user.department || "Unassigned"}</Badge>

 <div className="flex gap-2">
 {(user.role === 'faculty' || user.role === 'admin') && (
 <button type="button" onClick={() => setEditFacultyId(user.db_id)} className="w-8 h-8 rounded-lg bg-amber-500/10 border border-gray-200 dark:border-white/5Accent/30 hover:bg-amber-500/20 text-amber-500 flex items-center justify-center transition-colors" title="Edit Website Profile">
 <i className="fa-solid fa-globe text-[10px]"></i>
 </button>
 )}
 <button type="button" onClick={() => handleResetPassword(user)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 text-gray-500 dark:text-white/50 flex items-center justify-center">
 <i className="fa-solid fa-key text-[10px]"></i>
 </button>
 <button type="button" onClick={() => handleToggleStatus(user)} className={`w-8 h-8 rounded-lg border-gray-200 dark:border-white/5 flex items-center justify-center ${user.status === 'Active' ? 'bg-gray-100 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/5 text-rose-400' : 'bg-rose-500 border-rose-600 text-gray-900 dark:text-white'}`}>
 <i className={`fa-solid ${user.status === 'Active' ? 'fa-ban' : 'fa-rotate-left'} text-[10px]`}></i>
 </button>
 </div>
 </div>
 </div>
 ))}
 {!isLoading && currentList.length === 0 && (
 <div className="py-10 text-center text-gray-500 dark:text-white/50 opacity-70 font-bold text-xs">
 No users found matching your criteria.
 </div>
 )}
 </div>
 </div>
 </div>

 {/* 3. PROVISIONING WIZARD MODAL */}
 {showProvisionModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
 <div className="bg-white dark:bg-[#121212] w-full max-w-2xl rounded-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 flex flex-col max-h-[90vh]">

 {/* Modal Header */}
 <div className="bg-gray-100 dark:bg-[#1A1A1A] p-5 lg:p-6 text-gray-900 dark:text-white relative shrink-0 border-b border-gray-200 dark:border-white/5">
 <div className="flex justify-between items-start relative z-10">
 <div>
 <h3 className="text-lg lg:text-xl font-semibold tracking-tight tracking-tight mb-1 text-gray-900 dark:text-white">Provision New Account</h3>
 <p className={`text-[10px] lg:text-xs text-amber-500 font-medium`}>Generate credentials and assign records.</p>
 </div>
 <button type="button" onClick={closeProvisionWizard} className="w-8 h-8 flex items-center justify-center rounded-full bg-themeApp hover:bg-themeBorder border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white transition-colors shrink-0">
 <i className="fa-solid fa-xmark text-sm"></i>
 </button>
 </div>
 </div>

 {/* Modal Form Content */}
 <div className="overflow-y-auto p-5 lg:p-6 flex-1 bg-themeApp no-scrollbar">
 {provisionSuccess ? (
 <div className="flex flex-col items-center justify-center py-8 lg:py-10 animate-fade-in text-center">
 <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 dark:bg-[#1A1A1A] text-emerald-400 border-gray-200 dark:border-white/5 border-emerald-500/30 rounded-full flex items-center justify-center text-3xl lg:text-4xl mb-4">
 <i className="fa-solid fa-check"></i>
 </div>
 <h3 className={`font-bold tracking-tight text-xl lg:text-2xl text-gray-900 dark:text-white mb-1`}>Account Provisioned!</h3>
 <p className={`text-xs lg:text-sm text-[#8E8E93] mb-6 lg:mb-8`}>Securely share these credentials.</p>

 <div className="w-full max-w-sm bg-white dark:bg-[#121212] rounded-2xl p-5 lg:p-6 border border-gray-200 dark:border-white/5 flex flex-col gap-4 relative overflow-hidden text-left">
 <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>

 <div className="border-t border-gray-200 dark:border-white/5 pt-3 lg:pt-4">
 <span className={`text-[9px] lg:text-[13px] font-medium text-[#8E8E93] mb-2 block`}>Automation Logs</span>
 <div className="bg-themeApp border border-gray-200 dark:border-white/5 rounded-lg p-3 text-left font-mono text-[10px] lg:text-xs h-32 overflow-y-auto">
 {provisionLogs.map((log, i) => (
 <div key={i} className={`mb-1 ${log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('ERROR') || log.includes('WARNING') ? 'text-rose-400' : 'text-gray-500 dark:text-white/50'}`}>
 &gt; {log}
 </div>
 ))}
 </div>
 </div>
 </div>

 <button type="button" onClick={closeProvisionWizard} className="mt-6 lg:mt-8 text-[10px] lg:text-[14px] font-medium tracking-normal text-gray-500 dark:text-white/50 opacity-70 hover:text-gray-900 dark:text-white transition-colors">
 Done & Close
 </button>
 </div>
 ) : (
 <form onSubmit={handleProvisionSubmit} className="flex flex-col gap-5 lg:gap-6">

 {/* Role Selector */}
 <div className="flex p-1.5 bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/5 w-full">
 <button type="button" onClick={() => setNewUserRole("student")} className={`flex-1 py-3 rounded-lg text-[9px] lg:text-[13px] font-medium transition ${newUserRole === 'student' ? 'bg-gray-100 dark:bg-[#1A1A1A] text-amber-500 border border-gray-200 dark:border-white/5' : 'text-neutral-600 hover:text-gray-900 dark:text-white'}`}>Student</button>
 <button type="button" onClick={() => setNewUserRole("faculty")} className={`flex-1 py-3 rounded-lg text-[9px] lg:text-[13px] font-medium transition ${newUserRole === 'faculty' ? 'bg-gray-100 dark:bg-[#1A1A1A] text-amber-500 border border-gray-200 dark:border-white/5' : 'text-neutral-600 hover:text-gray-900 dark:text-white'}`}>Faculty</button>
 </div>

 <div className="grid grid-cols-1 gap-4 lg:gap-5">
 <div>
 <label className={`block text-[9px] lg:text-[13px] font-medium text-[#8E8E93] mb-1.5 ml-1`}>
 Assign Batch (Programme & Year)
 </label>
 <div className="relative">
 <select
 value={assignment}
 onChange={(e) => setAssignment(e.target.value)}
 className="w-full border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3 text-xs lg:text-sm font-bold bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:bg-gray-100 dark:bg-[#1A1A1A] focus:border-gray-200 dark:border-white/5Accent outline-none transition appearance-none cursor-pointer"
 required
 >
 
 <option value="">Select Batch...</option>
 <option value="BBA LLB (2024-2029)">BBA LLB (2024-2029)</option>
 <option value="BA LLB (2024-2029)">BA LLB (2024-2029)</option>
 <option value="LLB (2024-2027)">LLB (2024-2027)</option>
 <option value="BBA LLB (2023-2028)">BBA LLB (2023-2028)</option>
 <option value="BA LLB (2023-2028)">BA LLB (2023-2028)</option>
 <option value="LLB (2023-2026)">LLB (2023-2026)</option>
 <option value="BBA LLB (2022-2027)">BBA LLB (2022-2027)</option>
 <option value="BA LLB (2022-2027)">BA LLB (2022-2027)</option>
 <option value="LLB (2022-2025)">LLB (2022-2025)</option>

 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50 opacity-70 pointer-events-none text-xs"></i>
 </div>
 </div>

 <div>
                <label className={`block text-[9px] lg:text-[13px] font-medium text-[#8E8E93] mb-1.5 ml-1`}>User Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3 text-xs lg:text-sm font-bold bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:bg-gray-100 dark:bg-[#1A1A1A] focus:border-gray-200 dark:border-white/5Accent outline-none transition placeholder:text-neutral-600"
                  required
                />
              </div>
              <div>
                <label className={`block text-[9px] lg:text-[13px] font-medium text-[#8E8E93] mb-1.5 ml-1`}>Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. john@prudentia.edu"
                  className="w-full border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3 text-xs lg:text-sm font-bold bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:bg-gray-100 dark:bg-[#1A1A1A] focus:border-gray-200 dark:border-white/5Accent outline-none transition placeholder:text-neutral-600"
                  required
                />
              </div>
 </div>

 {/* Logs Display during provisioning */}
 {isProvisioning && (
 <div className="bg-themeApp border border-gray-200 dark:border-white/5 rounded-lg p-3 text-left font-mono text-[10px] h-32 overflow-y-auto mt-2">
 {provisionLogs.map((log, i) => (
 <div key={i} className={`mb-1 ${log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('ERROR') || log.includes('WARNING') ? 'text-rose-400' : 'text-gray-500 dark:text-white/50'}`}>
 &gt; {log}
 </div>
 ))}
 </div>
 )}

 </form>
 )}
 </div>

 {/* Modal Footer */}
 {!provisionSuccess && (
 <div className="p-4 lg:p-5 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#121212] shrink-0 flex flex-col sm:flex-row gap-3">
 <button type="button" onClick={closeProvisionWizard} className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-themeBorder text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal transition-colors border border-gray-200 dark:border-white/5 active:scale-95">Cancel</button>
 <button type="button" onClick={handleProvisionSubmit} disabled={isProvisioning || !newUserName || !newUserEmail || !assignment} className="w-full sm:flex-1 bg-amber-500 hover:bg-amber-500Muted text-gray-900 dark:text-white rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal transition disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2 group relative overflow-hidden active:scale-[0.98]">
 {!isProvisioning && newUserName && newUserEmail && assignment && (
 <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:"></div>
 )}
 {isProvisioning ? <><i className="fa-solid fa-circle-notch fa-spin text-sm"></i> Provisioning...</> : <><i className="fa-solid fa-server text-sm"></i> Execute Provisioning</>}
 </button>
 </div>
 )}
 </div>
 </div>
 )}

 {/* 4. ADMIN QUESTIONNAIRE OVERRIDE MODAL */}
 {selectedQuestionnaireUser && (
 <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
 <div className={`w-full max-w-lg bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
 <div className="p-6 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-100 dark:bg-[#1A1A1A]">
 <div>
 <h3 className={`font-bold tracking-tight text-lg text-gray-900 dark:text-white`}>Edit Questionnaire Data</h3>
 <p className="text-xs text-gray-500 dark:text-white/50 font-medium mt-1">For: {selectedQuestionnaireUser.name} ({selectedQuestionnaireUser.id})</p>
 </div>
 <button type="button" onClick={() => setSelectedQuestionnaireUser(null)} className="w-8 h-8 rounded-full bg-themeApp text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white flex items-center justify-center border border-gray-200 dark:border-white/5 transition-colors">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar bg-themeApp">
 {selectedQuestionnaireUser.role === 'faculty' && facultyProfileData ? (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Public Display (Website)</label>
            <select value={facultyProfileData.is_public ? 'true' : 'false'} onChange={e => setFacultyProfileData({...facultyProfileData, is_public: e.target.value === 'true'})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3 text-xs font-bold text-gray-900 dark:text-white outline-none">
                <option value="true">Visible on Website</option>
                <option value="false">Hidden from Website</option>
            </select>
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Designation</label>
            <input type="text" value={facultyProfileData.designation || ''} onChange={e => setFacultyProfileData({...facultyProfileData, designation: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Biography / About</label>
            <textarea rows="4" value={facultyProfileData.bio || ''} onChange={e => setFacultyProfileData({...facultyProfileData, bio: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3 text-xs font-medium text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors custom-scrollbar resize-none" placeholder="Detailed bio..."></textarea>
        </div>
    </div>
) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Legal Interest</label>
            <input type="text" value={qFormData.legalInterest || ''} onChange={e => setQFormData({...qFormData, legalInterest: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Blood Group</label>
            <input type="text" value={qFormData.bloodGroup || ''} onChange={e => setQFormData({...qFormData, bloodGroup: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Aadhar Number</label>
            <input type="text" value={qFormData.aadharNumber || ''} onChange={e => setQFormData({...qFormData, aadharNumber: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Past Legal Gens</label>
            <input type="text" value={qFormData.pastLegalGenerations || ''} onChange={e => setQFormData({...qFormData, pastLegalGenerations: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Father's Name</label>
            <input type="text" value={qFormData.fatherName || ''} onChange={e => setQFormData({...qFormData, fatherName: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Mother's Name</label>
            <input type="text" value={qFormData.motherName || ''} onChange={e => setQFormData({...qFormData, motherName: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
    </div>
)}

 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Present Address</label>
 <textarea rows="2" value={qFormData.presentAddress || ''} onChange={e => setQFormData({...qFormData, presentAddress: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors resize-none" />
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Permanent Address</label>
 <textarea rows="2" value={qFormData.permanentAddress || ''} onChange={e => setQFormData({...qFormData, permanentAddress: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors resize-none" />
 </div>

 {selectedQuestionnaireUser.role === 'faculty' && facultyProfileData ? (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Public Display (Website)</label>
            <select value={facultyProfileData.is_public ? 'true' : 'false'} onChange={e => setFacultyProfileData({...facultyProfileData, is_public: e.target.value === 'true'})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3 text-xs font-bold text-gray-900 dark:text-white outline-none">
                <option value="true">Visible on Website</option>
                <option value="false">Hidden from Website</option>
            </select>
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Designation</label>
            <input type="text" value={facultyProfileData.designation || ''} onChange={e => setFacultyProfileData({...facultyProfileData, designation: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Biography / About</label>
            <textarea rows="4" value={facultyProfileData.bio || ''} onChange={e => setFacultyProfileData({...facultyProfileData, bio: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3 text-xs font-medium text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors custom-scrollbar resize-none" placeholder="Detailed bio..."></textarea>
        </div>
    </div>
) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Legal Interest</label>
            <input type="text" value={qFormData.legalInterest || ''} onChange={e => setQFormData({...qFormData, legalInterest: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Blood Group</label>
            <input type="text" value={qFormData.bloodGroup || ''} onChange={e => setQFormData({...qFormData, bloodGroup: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Aadhar Number</label>
            <input type="text" value={qFormData.aadharNumber || ''} onChange={e => setQFormData({...qFormData, aadharNumber: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Past Legal Gens</label>
            <input type="text" value={qFormData.pastLegalGenerations || ''} onChange={e => setQFormData({...qFormData, pastLegalGenerations: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Father's Name</label>
            <input type="text" value={qFormData.fatherName || ''} onChange={e => setQFormData({...qFormData, fatherName: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 dark:text-white/50 tracking-normal font-bold ml-1">Mother's Name</label>
            <input type="text" value={qFormData.motherName || ''} onChange={e => setQFormData({...qFormData, motherName: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-3.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors" />
        </div>
    </div>
)}
 </div>
 <div className="p-5 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#121212] flex justify-end gap-3 shrink-0">
 <button type="button" onClick={() => setSelectedQuestionnaireUser(null)} className="px-6 py-3 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-themeBorder text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white rounded-2xl text-[13px] font-medium transition-colors border border-gray-200 dark:border-white/5">Cancel</button>
 <button type="button" onClick={handleSaveQuestionnaire} className="btn-erp">Save Override</button>
 </div>
 </div>
 </div>
 )}
 {/* User Profile Modal */}
 <AdminUserProfileModal 
 user={selectedProfileUser} 
 isOpen={isProfileModalOpen} 
 onClose={() => setIsProfileModalOpen(false)} 
 />

 
      <AdminUserEditorModal
        user={editBasicUserId}
        isOpen={!!editBasicUserId}
        onClose={() => setEditBasicUserId(null)}
        onUpdate={fetchDirectory}
      />

      {editFacultyId && (
        <AdminFacultyEditorModal 
          facultyId={editFacultyId} 
          onClose={() => { setEditFacultyId(null); fetchDirectory(); }} 
        />
      )}
      {showPasswordResetsModal && (
 <AdminPasswordResetsModal onClose={() => setShowPasswordResetsModal(false)} />
 )}
 </div>
 </div>
 );
}