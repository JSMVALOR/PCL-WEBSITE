/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
"use client";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { Badge } from "../../ui/Badge";

import React, { useState, useEffect } from "react";
import { createPortal } from 'react-dom';
import { sendSystemEmail } from '../../../lib/EmailService';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { theme } from '../../../../Shared/theme';
import { createClient } from '@supabase/supabase-js';
import AdminFacultyEditorModal from "../AdminFacultyDirectory/AdminFacultyEditorModal";
import AdminStudentCVModal from './AdminStudentCVModal';
import AdminUserEditorModal from './AdminUserEditorModal';
import AdminUserProfileModal from './AdminUserProfileModal';
import UserProvisioningHub from './UserProvisioningHub';
import { getAvatarUrl } from '../../../utils/avatarUtils';

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
 const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

 const [selectedQuestionnaireUser, setSelectedQuestionnaireUser] = useState(null);
 const [editBasicUserId, setEditBasicUserId] = useState(null);
 const [editFacultyId, setEditFacultyId] = useState(null);
 const [qFormData, setQFormData] = useState({});

 // Profile Modal State
 const [selectedProfileUser, setSelectedProfileUser] = useState(null);
 const [facultyProfileData, setFacultyProfileData] = useState(null);
 const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

 // Provisioning Form State
 const [newUserRole, setNewUserRole] = useState("student");
 const [newUserName, setNewUserName] = useState("");
 const [newUserEmail, setNewUserEmail] = useState("");
 const [assignment, setAssignment] = useState("");
 const [provisionLogs, setProvisionLogs] = useState([]);
 
 // Feature state
 const [transferModalState, setTransferModalState] = useState({ isOpen: false, sourceUser: null, classes: 0, subjects: 0, isDeactivating: false, selectedTarget: '' });

 // Actual Data
 const [usersData, setUsersData] = useState(() => {
 if (typeof window !== "undefined") {
 try {
 const cached = sessionStorage.getItem(CACHE_KEY);
 if (cached) {
 const parsed = JSON.parse(cached);
 if (parsed && parsed.students && parsed.faculty) return parsed;
 }
 } catch (e) { console.error(e); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
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
 section: p.section,
 department: p.department,
 email: p.email,
 avatar_url: p.profile_picture_url,
 role: p.role,
 status: p.status || 'Active',
 questionnaire_data: p.questionnaire_data,
 application_number: p.application_number,
 admission_type: p.admission_type,
 application_date: p.application_date,
 joining_date: p.joining_date
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
 } catch (error) { console.error(error); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchDirectory();
 }, []);

 // --- ADMIN ACTIONS ---
 const handleToggleStatus = async (user) => {
 const isRestricting = user.status === 'Active';
 const newStatus = isRestricting ? 'Suspended' : 'Active';
 
 if (isRestricting) {
 if (user.role === 'faculty') {
 const { data: scheduleCount } = await supabase.from('class_schedule').select('id', { count: 'exact' }).eq('faculty_id', user.db_id);
 const { data: subjectCount } = await supabase.from('cohort_subjects').select('id', { count: 'exact' }).eq('faculty_id', user.db_id);
 
 if (scheduleCount?.length > 0 || subjectCount?.length > 0) {
 setTransferModalState({
 isOpen: true,
 sourceUser: user,
 classes: scheduleCount.length,
 subjects: subjectCount.length,
 isDeactivating: true,
 selectedTarget: ''
 });
 return;
 }
 }

 const input = await window.erpDialog.prompt(
 `You are about to suspend access for ${user.name}.\n\n` + 
 `If suspended:\n` +
 `• They will be immediately blocked from logging into the ERP.\n` +
 `• Their account will not appear in allocations (Mentorship, etc.).\n\n` +
 `Type "SUSPEND" below to confirm this action.`,
 "Account Restriction Warning",
 "",
 true
 );
 if (input !== 'SUSPEND') {
 if (input !== null) window.erpDialog.alert("Action cancelled. You must type SUSPEND exactly.");
 return;
 }
 } else {
 if (!(await window.erpDialog.confirm(`Reactivate account for ${user.name}?`))) return;
 }

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

 const { error } = await supabase.rpc('admin_update_profile_status', { target_user_id: user.db_id, new_status: newStatus });
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
  console.warn("Email dispatch skipped (template might not exist):", err); 
}
if (window.erpToast) window.erpToast.show("Account " + newStatus.toLowerCase() + " successfully.", "success");

 } catch (error) {
 if(window.erpToast) window.erpToast.show("Failed to update status: " + error.message, "error");
 }
 };

 const handleOpenTransfer = async (user) => {
 try {
 setIsLoading(true);
 const { data: scheduleCount } = await supabase.from('class_schedule').select('id', { count: 'exact' }).eq('faculty_id', user.db_id);
 const { data: subjectCount } = await supabase.from('cohort_subjects').select('id', { count: 'exact' }).eq('faculty_id', user.db_id);
 
 setTransferModalState({
 isOpen: true,
 sourceUser: user,
 classes: scheduleCount?.length || 0,
 subjects: subjectCount?.length || 0,
 isDeactivating: false,
 selectedTarget: ''
 });
 } catch (e) {
 if(window.erpToast) window.erpToast.show("Failed to load workload stats: " + e.message, "error");
 } finally {
 setIsLoading(false);
 }
 };

 
 
 const executeDeletion = async (user) => {
   if (!(await window.erpDialog.confirm("Are you sure you want to permanently delete this user? This action cannot be undone."))) return;

   setTransferModalState({ isOpen: false, sourceUser: null, classes: 0, subjects: 0, isDeactivating: false, selectedTarget: '' });
   setIsLoading(true);

   try {
     // Pre-delete dependent records to satisfy FK constraints if DB isn't CASCADE yet
     await supabase.from('mentorship_meetings').delete().or(`mentee_id.eq.${user.db_id},mentor_id.eq.${user.db_id}`);
     await supabase.from('mentorship').delete().or(`student_id.eq.${user.db_id},mentor_id.eq.${user.db_id}`);
     await supabase.from('attendance_records').delete().eq('student_id', user.db_id);
     
     const { error } = await supabase.rpc('admin_delete_user', { target_user_id: user.db_id });
     if (error) throw error;
     
     if (window.erpToast) window.erpToast.show("User permanently deleted.", "success");
     fetchDirectory();
   } catch(e) {
     if (window.erpToast) window.erpToast.show("Failed to delete user: " + e.message, "error");
   } finally {
     setIsLoading(false);
   }
 };

 const executeSuspension = async (user) => {

   const input = await window.erpDialog.prompt(
     `You are about to suspend access for ${user.name}.\n\n` + 
     `If suspended:\n` +
     `• They will be immediately blocked from logging into the ERP.\n` +
     `• Their account will not appear in allocations.\n\n` +
     `Type "SUSPEND" below to confirm this action.`,
     "Account Restriction Warning",
     "",
     true
   );
   if (input !== 'SUSPEND') {
     if (input !== null) window.erpDialog.alert("Action cancelled. You must type SUSPEND exactly.");
     return;
   }

   setTransferModalState({ isOpen: false, sourceUser: null, classes: 0, subjects: 0, isDeactivating: false, selectedTarget: '' });
   setIsLoading(true);

   try {
     const newStatus = 'Suspended';
     const { error: restrictError } = await supabase.from('profiles').update({ status: newStatus }).eq('id', user.db_id);
     if (restrictError) throw restrictError;

     const updatedUsers = { ...usersData };
     const list = user.batch ? updatedUsers.students : updatedUsers.faculty;
     const index = list.findIndex(u => u.db_id === user.db_id);
     if (index !== -1) {
       list[index].status = newStatus;
       updatedUsers.disciplinary.push({...list[index], status: newStatus});
     }
     setUsersData(updatedUsers);

     await supabase.rpc('admin_update_profile_status', { target_user_id: user.db_id, new_status: newStatus });
     try {
       await sendSystemEmail('ACCOUNT_LOCKED', { to_email: user.email, name: user.name });
     } catch(e) {}
     
     if (window.erpToast) window.erpToast.show("Account suspended successfully.", "success");
   } catch(e) {
     if (window.erpToast) window.erpToast.show("Failed to suspend: " + e.message, "error");
   } finally {
     setIsLoading(false);
   }
 };

 const handleWorkloadTransferSubmit = async () => {

 const { sourceUser, isDeactivating, selectedTarget } = transferModalState;
 if (!selectedTarget) return window.erpDialog.alert("Please select a target faculty member.");
 
 setIsLoading(true);
 setTransferModalState({ ...transferModalState, isOpen: false });

 try {
 const { error } = await supabase.rpc('admin_reassign_faculty_workload', {
 old_faculty_id: sourceUser.db_id,
 new_faculty_id: selectedTarget
 });
 if (error) throw error;

 if(window.erpToast) window.erpToast.show("Workload successfully reassigned.", "success");
 
 if (isDeactivating) {
 const input = await window.erpDialog.prompt(
 `Workload transferred. Now you can suspend access for ${sourceUser.name}.\n\n` + 
 `Type "SUSPEND" below to confirm this action.`,
 "Account Restriction Warning",
 "",
 true
 );
 if (input === 'SUSPEND') {
 const newStatus = 'Suspended';
 const { error: restrictError } = await supabase.from('profiles').update({ status: newStatus }).eq('id', sourceUser.db_id);
 if (restrictError) throw restrictError;
 
 const updatedUsers = { ...usersData };
 const list = updatedUsers.faculty;
 const index = list.findIndex(u => u.db_id === sourceUser.db_id);
 if (index !== -1) list[index].status = newStatus;
 updatedUsers.disciplinary.push({...list[index], status: newStatus});
 setUsersData(updatedUsers);
 
 try {
 await sendSystemEmail('ACCOUNT_LOCKED', { to_email: sourceUser.email, name: sourceUser.name });
 } catch(e) {}
 }
 }
 } catch (err) {
 if(window.erpToast) window.erpToast.show("Transfer failed: " + err.message, "error");
 } finally {
 setIsLoading(false);
 }
 };

 const handleResetPassword = async (user) => {
 if (!(await window.erpDialog.confirm(`Generate and email a new temporary passcode for ${user.name} (${user.email})?`))) return;
 try {
 const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
 let newPass = "PCL";
 const alphaNumChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
 for (let i = 0; i < 6; i++) {
 newPass += alphaNumChars.charAt(Math.floor(Math.random() * alphaNumChars.length));
 }
 
 const { error } = await supabase.rpc('admin_reset_password', {
 target_user_id: user.db_id,
 new_password: newPass
 });
 
 if (error) throw error;
 
 await sendSystemEmail('PASSCODE_RESET', { to_email: user.email, name: user.name, password: newPass, erp_id: user.id });
 window.erpDialog.alert("New temporary passcode sent to " + user.email);
 } catch (error) {
 if(window.erpToast) window.erpToast.show("Failed to reset passcode: " + error.message, "error");
 }
 };

 // --- PROVISIONING LOGIC ---
 
 const handleSaveQuestionnaire = async () => {
 try {
 const { error } = await supabase.from('profiles').update({
 questionnaire_data: qFormData
 }).eq('id', selectedQuestionnaireUser.db_id);
 
 if (error) throw error;
 if(window.erpToast) window.erpToast.show("Questionnaire data updated successfully.", "success");
 setSelectedQuestionnaireUser(null);
 fetchDirectory();
 } catch (error) {
 if(window.erpToast) window.erpToast.show("Failed to update questionnaire: " + error.message, "error");
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
 target_audience: ['person'],
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
 if(window.erpToast) window.erpToast.show("Failed to trigger questionnaire: " + error.message, "error");
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
 const prefix = newUserRole === "student" ? `${yearPrefix}${shortcut}` : "FAC";
 
 const { data: highestIdData } = await supabase
 .from('profiles')
 .select('erp_id')
 .ilike('erp_id', `${prefix}%`)
 .order('erp_id', { ascending: false })
 .limit(1);

 let nextNum = 1;
 if (highestIdData && highestIdData.length > 0 && highestIdData[0].erp_id) {
 const lastId = highestIdData[0].erp_id;
 const numMatch = lastId.match(/\d+$/);
 const parsedNum = numMatch ? parseInt(numMatch[0], 10) : 0;
 if (!isNaN(parsedNum) && parsedNum > 0) nextNum = parsedNum + 1;
 }
 
 const generatedId = `${prefix}${nextNum.toString().padStart(4, '0')}`;
 
 const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
 let generatedPassword = "Jsm#";
 for (let i = 0; i < 6; i++) {
 generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
 }

 setProvisionLogs(prev => [...prev, `[INIT] Provisioning ${generatedId} for ${newUserEmail}...`]);

 const { data: newUserId, error: rpcError } = await supabase.rpc('admin_create_user', {
 new_email: newUserEmail,
 new_password: generatedPassword,
 new_role: newUserRole,
 new_erp_id: generatedId,
 new_name: newUserName,
 new_assignment: assignment
 });

 if (rpcError) throw rpcError;

 setProvisionLogs(prev => [...prev, `[SUCCESS] Profile generated and activated.`]);

 // Dispatch Email
 try {
 await sendSystemEmail('ERP_NEW_ACCOUNT', {
 to_email: newUserEmail,
 name: newUserName,
 erp_id: generatedId,
 password: generatedPassword
 });
 setProvisionLogs(prev => [...prev, `[EMAIL SUCCESS] Credentials securely dispatched to ${newUserEmail}`]);
 } catch (emailErr) {
 setProvisionLogs(prev => [...prev, `[WARNING] Email dispatch failed: ${emailErr.message}. Manual share required: ${generatedPassword}`]);
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
 <div className={`w-full animate-fade-in selection:bg-themeElevated dark:bg-themeApp ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText " : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-10 lg:pb-10 xl:pb-8" : "pb-10"}`}>

 {/* 1. MASTER HEADER */}
 {!isHubView && (
 <PageHeader icon="fa-solid fa-users-gear" title="User Access Management" subtitle="Provision accounts, manage roles, and maintain the college directory." rightContent={
<>
<div className="flex gap-3 w-full lg:w-auto">
 <button type="button"
 onClick={() => setShowProvisionModal(true)}
 className="flex-1 lg:flex-none px-6 py-3 bg-themeAccent/10 hover:bg-themeAccent/20 text-themeAccent border-themeAccent/20 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition flex items-center justify-center gap-2 "
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
 className="bg-themeAccent hover:bg-themeAccent/90 text-themeText px-6 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition flex justify-center items-center gap-2 border border-themeBorder dark:border-white/[0.08]Accent active:scale-[0.98]"
 >
 <i className="fa-solid fa-user-plus text-base"></i> Rapid Provisioning
 </button>
 </div>
 )}

 {/* 2. CONTROLS & DIRECTORY */}
 <div className="flex flex-col gap-4 lg:gap-6 animate-fade-in">

 {/* Top Controls: Tabs, Search, Sort */}
 <div className={`${theme.layout.panel} rounded-2xl p-4 lg:p-5 flex flex-col lg:flex-row justify-between items-center gap-4 border border-themeBorder dark:border-white/[0.08]`}>
 
 {/* Tabs */}
 <div className="flex p-1.5 bg-themeApp rounded-2xl border border-themeBorder dark:border-white/[0.08] w-full lg:w-auto shrink-0">
 <button type="button"
 onClick={() => setActiveTab('students')}
 className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 rounded-lg text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 ${activeTab === 'students' ? "bg-themeElevated dark:bg-themeApp text-themeAccent border border-themeBorder dark:border-white/[0.08]" : "text-themeTextSec opacity-70 hover:text-themeText hover:bg-themeElevated dark:bg-themeApp/50 border border-transparent"}`}
 >
 Students <span className="ml-2 px-1.5 py-0.5 bg-themeApp rounded-md text-[9px] text-themeTextSec ">{usersData.students.length}</span>
 </button>
 <button type="button"
 onClick={() => setActiveTab('faculty')}
 className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 rounded-lg text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 ${activeTab === 'faculty' ? "bg-themeElevated dark:bg-themeApp text-themeAccent border border-themeBorder dark:border-white/[0.08]" : "text-themeTextSec opacity-70 hover:text-themeText hover:bg-themeElevated dark:bg-themeApp/50 border border-transparent"}`}
 >
 Faculty <span className="ml-2 px-1.5 py-0.5 bg-themeApp rounded-md text-[9px] text-themeTextSec ">{usersData.faculty.length}</span>
 </button>
 
 </div>

 <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 items-center">
 {/* Search */}
 <div className="relative w-full sm:w-64 group">
 <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 group-focus-within:text-themeAccent transition-colors text-sm"></i>
 <input
 type="text"
 placeholder="Search Name, ID, Email..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl pl-10 pr-4 py-3 text-xs lg:text-sm font-bold text-themeText focus:bg-themeElevated dark:bg-themeApp focus:border-themeBorder Accent outline-none transition placeholder:text-neutral-600"
 />
 </div>

 {/* Sort */}
 <div className="relative w-full sm:w-48">
 <select 
 value={sortBy} 
 onChange={(e) => setSortBy(e.target.value)}
 className="w-full bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl px-4 py-3 text-xs lg:text-sm font-bold text-themeText focus:bg-themeElevated dark:bg-themeApp focus:border-themeBorder Accent outline-none appearance-none cursor-pointer"
 >
 <option value="name_asc">Sort: Name (A-Z)</option>
 <option value="name_desc">Sort: Name (Z-A)</option>
 <option value="id_asc">Sort: ERP ID (Asc)</option>
 <option value="id_desc">Sort: ERP ID (Desc)</option>
 <option value="status">Sort: Status</option>
 </select>
 <i className="fa-solid fa-arrow-down-a-z absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none text-sm"></i>
 </div>
 
 {/* View Mode Toggle */}
 <div className="hidden lg:flex items-center gap-1 bg-themeElevated dark:bg-themeApp p-1 rounded-xl border border-themeBorder dark:border-white/[0.08]">
 <button type="button" onClick={() => setViewMode('list')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-themePanel text-themeText shadow-sm' : 'text-themeTextSec opacity-50 hover:opacity-100'}`} title="List View">
 <i className="fa-solid fa-list text-xs"></i>
 </button>
 <button type="button" onClick={() => setViewMode('grid')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-themePanel text-themeText shadow-sm' : 'text-themeTextSec opacity-50 hover:opacity-100'}`} title="Grid View">
 <i className="fa-solid fa-border-all text-xs"></i>
 </button>
 </div>
 </div>
 </div>

 {/* Data Grid / Mobile Cards */}
 <div className={`${theme.layout.panel} rounded-2xl rounded-2xl overflow-hidden border border-themeBorder dark:border-white/[0.08] min-h-[400px]`}>
 
 {/* Desktop Table View */}
 <div className="hidden md:block overflow-x-auto no-scrollbar">
 {viewMode === 'grid' ? (
 <div className="p-6">
 {isLoading ? (
 <div className="py-12 text-center text-themeTextSec opacity-70 font-bold text-sm">
 <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading directory...
 </div>
 ) : currentList.length === 0 ? (
 <div className="py-12 text-center text-themeTextSec opacity-70 font-bold text-sm">
 No users found matching your criteria.
 </div>
 ) : (
 <div className="flex flex-col gap-8">
 {Object.entries(
 currentList.reduce((acc, user) => {
 const group = user.batch || user.department || "Unassigned";
 if (!acc[group]) acc[group] = [];
 acc[group].push(user);
 return acc;
 }, {})
 ).map(([group, users]) => (
 <div key={group} className="flex flex-col gap-4">
 <h3 className="text-[11px] font-black uppercase tracking-widest text-themeTextSec/80 border-b border-themeBorder dark:border-white/[0.08] pb-2 pl-2">{group} <span className="ml-2 px-1.5 py-0.5 bg-themeElevated rounded-md text-[9px]">{users.length}</span></h3>
 <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
 {users.map(user => (
 <div key={user.db_id} className="flex flex-col items-center p-5 rounded-3xl border border-themeBorder dark:border-white/[0.08] bg-themeApp hover:shadow-lg transition-all group relative cursor-pointer" onClick={() => { setSelectedProfileUser(user); setIsProfileModalOpen(true); }}>
 <div className={`absolute top-4 left-4 w-2.5 h-2.5 rounded-full border-2 ${user.status === 'Active' ? 'bg-emerald-500 border-emerald-900' : 'bg-rose-500 border-rose-900'}`} title={user.status}></div>
 <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-black/10 rounded-xl p-1 backdrop-blur-sm z-10" onClick={(e) => e.stopPropagation()}>
 <button type="button" onClick={() => setEditBasicUserId(user)} className="w-7 h-7 rounded-lg flex items-center justify-center text-themeText hover:text-emerald-500 hover:bg-themeElevated transition-colors"><i className="fa-solid fa-pen text-[10px]"></i></button>
 <button type="button" onClick={() => handleToggleStatus(user)} className="w-7 h-7 rounded-lg flex items-center justify-center text-themeText hover:text-rose-500 hover:bg-themeElevated transition-colors"><i className="fa-solid fa-ban text-[10px]"></i></button>
 </div>
 <img src={getAvatarUrl({ name: user.name, avatar_url: user.avatar_url })} alt={user.name} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&rounded=true&bold=true`; }} className="w-20 h-20 rounded-[1.25rem] object-cover mb-4 border-4 border-themeBorder shadow-sm group-hover:scale-105 transition-transform duration-300" />
 <h4 className="text-[14px] font-bold text-center text-themeText truncate w-full px-2">{user.name}</h4>
 <span className="text-[11px] font-bold text-themeTextSec tracking-widest mt-1 uppercase">{user.id}</span>
 <span className="text-[10px] font-medium text-themeAccent/80 truncate w-full text-center mt-1 px-2">{user.email}</span>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 ) : (
 <table className="w-full text-left border-collapse min-w-[800px]">
 <thead>
 <tr className="bg-themeApp border-b border-themeBorder ">
 <th className={`p-4 lg:p-5 pl-5 lg:pl-6 text-[9px] lg:text-[10px] font-black text-themeTextSec tracking-normal w-12 lg:w-16`}>Status</th>
 <th className={`p-4 lg:p-5 text-[9px] lg:text-[10px] font-black text-themeTextSec tracking-normal`}>User Profile</th>
 <th className={`p-4 lg:p-5 text-[9px] lg:text-[10px] font-black text-themeTextSec tracking-normal`}>{activeTab === 'students' ? 'Curriculum / Batch' : 'Department'}</th>
 <th className={`p-4 lg:p-5 pr-5 lg:pr-6 text-[9px] lg:text-[10px] font-black text-themeTextSec tracking-normal text-right`}>Admin Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-themeBorder">
 {isLoading ? (
 <tr>
 <td colSpan="4" className="py-12 text-center text-themeTextSec opacity-70 font-bold text-sm">
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
 <img src={getAvatarUrl({ name: user.name, avatar_url: user.avatar_url })} alt={user.name} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&rounded=true&bold=true`; }} className="w-10 h-10 rounded-2xl object-cover shrink-0 group-hover/profile:shadow-lg transition-shadow border border-themeBorder dark:border-white/[0.08]" />
 <div className="min-w-0">
 <p className="text-[15px] font-semibold text-themeText group-hover/profile:text-themeAccent transition-colors truncate">{user.name}</p>
 <div className="flex items-center gap-2 mt-1">
 <span className={`text-[10px] font-bold text-themeTextSec tracking-normal shrink-0`}>{user.id}</span>
 <span className="w-1 h-1 bg-neutral-700 rounded-full shrink-0"></span>
 <span className={`text-[10px] font-medium text-themeAccent/80 truncate`}>{user.email}</span>
 </div>
 </div>
 </div>
 </td>
 <td className="p-4 lg:p-5">
 <Badge variant="secondary">{user.batch || user.department || "Unassigned"}</Badge>
 </td>
 <td className="p-4 lg:p-5 pr-5 lg:pr-6">
 <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
 <button type="button" onClick={() => setEditBasicUserId(user)} className="w-8 h-8 rounded-lg bg-themeApp border border-themeBorder dark:border-white/[0.08] hover:border-emerald-500 hover:text-emerald-400 text-themeTextSec flex items-center justify-center transition-colors" title="Edit Master Details">
 <i className="fa-solid fa-pen text-[10px]"></i>
 </button>
 {(user.role === 'faculty' || user.role === 'admin') && (
 <button type="button" onClick={() => setEditFacultyId(user.db_id)} className="w-8 h-8 rounded-lg bg-themeAccent/10 border border-themeBorder dark:border-white/[0.08]Accent/30 hover:bg-themeAccent/20 text-themeAccent flex items-center justify-center transition-colors" title="Edit Website Profile">
 <i className="fa-solid fa-globe text-[10px]"></i>
 </button>
 )}
 {user.role === 'faculty' && (
 <button type="button" onClick={() => handleOpenTransfer(user)} className="w-8 h-8 rounded-lg bg-themeApp border border-themeBorder dark:border-white/[0.08] hover:border-blue-500 hover:text-blue-500 text-themeTextSec flex items-center justify-center transition-colors" title="Transfer Workload">
 <i className="fa-solid fa-exchange-alt text-[10px]"></i>
 </button>
 )}
 {user.role === 'faculty' && (
 <button type="button" onClick={() => handleOpenTransfer(user)} className="w-8 h-8 rounded-lg bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] text-themeTextSec flex items-center justify-center transition-colors" title="Transfer Workload">
 <i className="fa-solid fa-exchange-alt text-[10px]"></i>
 </button>
 )}
 <button type="button" onClick={() => handleResetPassword(user)} className="w-8 h-8 rounded-lg bg-themeApp border border-themeBorder dark:border-white/[0.08] hover:border-indigo-500 hover:text-themeAccent text-themeTextSec flex items-center justify-center transition-colors" title="Reset Password">
 <i className="fa-solid fa-key text-[10px]"></i>
 </button>
 <button type="button" onClick={() => handleToggleStatus(user)} className={`w-8 h-8 rounded-lg bg-themeApp border-themeBorder flex items-center justify-center transition-colors ${user.status === 'Active' ? 'border-themeBorder hover:border-rose-500 hover:text-rose-500 text-themeTextSec ' : 'border-rose-500/50 bg-rose-500/10 text-rose-500 hover:bg-emerald-500 hover:text-themeText hover:border-emerald-500'}`} title={user.status === 'Active' ? 'Suspend Account' : 'Reactivate'}>
 <i className={`fa-solid ${user.status === 'Active' ? 'fa-ban' : 'fa-rotate-left'} text-[10px]`}></i>
 </button>
 </div>
 </td>
 </tr>
 ))}
 {!isLoading && currentList.length === 0 && (
 <tr>
 <td colSpan="4" className="py-12 text-center text-themeTextSec opacity-70 font-bold text-sm">
 No users found matching your criteria.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 )}
 </div>

 {/* Mobile Card View */}
 <div className="md:hidden flex flex-col divide-y divide-themeBorder bg-themeApp">
 {isLoading ? (
 <div className="py-10 text-center text-themeTextSec opacity-70 font-bold text-xs">
 <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading directory...
 </div>
 ) : currentList.map((user, i) => (
 <div key={i} className="p-4 flex flex-col gap-4">
 <div className="flex items-start justify-between gap-3">
 <div className="flex items-center gap-3 min-w-0 cursor-pointer group/profile" onClick={() => { setSelectedProfileUser(user); setIsProfileModalOpen(true); }}>
 <img src={getAvatarUrl({ name: user.name, avatar_url: user.avatar_url })} alt={user.name} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&rounded=true&bold=true`; }} className="w-10 h-10 rounded-2xl object-cover shrink-0 group-hover/profile:shadow-lg transition-shadow border border-themeBorder dark:border-white/[0.08]" />
 <div className="min-w-0">
 <p className="text-[15px] font-semibold text-themeText group-hover/profile:text-themeAccent transition-colors truncate">{user.name}</p>
 <div className="flex items-center gap-2 mt-0.5">
 <span className={`text-[10px] font-bold text-themeTextSec tracking-normal shrink-0`}>{user.id}</span>
 </div>
 </div>
 </div>
 <div className={`shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
 <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
 {user.status}
 </div>
 </div>
 
 <div className="flex items-center gap-2 text-xs font-medium text-themeAccent/80 bg-themeElevated dark:bg-themeApp p-2 rounded-lg border border-themeBorder dark:border-white/[0.08] truncate">
 <i className="fa-solid fa-envelope text-themeTextSec "></i> {user.email}
 </div>

 <div className="flex items-center justify-between mt-1">
 <Badge variant="secondary">{user.batch || user.department || "Unassigned"}</Badge>

 <div className="flex gap-2">
 <button type="button" onClick={() => setEditBasicUserId(user)} className="w-8 h-8 rounded-lg bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] text-themeTextSec flex items-center justify-center transition-colors" title="Edit Master Details">
 <i className="fa-solid fa-pen text-[10px]"></i>
 </button>
 {(user.role === 'faculty' || user.role === 'admin') && (
 <button type="button" onClick={() => setEditFacultyId(user.db_id)} className="w-8 h-8 rounded-lg bg-themeAccent/10 border border-themeBorder dark:border-white/[0.08]Accent/30 hover:bg-themeAccent/20 text-themeAccent flex items-center justify-center transition-colors" title="Edit Website Profile">
 <i className="fa-solid fa-globe text-[10px]"></i>
 </button>
 )}
 <button type="button" onClick={() => handleResetPassword(user)} className="w-8 h-8 rounded-lg bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] text-themeTextSec flex items-center justify-center">
 <i className="fa-solid fa-key text-[10px]"></i>
 </button>
 <button type="button" onClick={() => handleToggleStatus(user)} className={`w-8 h-8 rounded-lg border-themeBorder flex items-center justify-center ${user.status === 'Active' ? 'bg-themeElevated dark:bg-themeApp border-themeBorder text-rose-400' : 'bg-rose-500 border-rose-600 text-themeText '}`}>
 <i className={`fa-solid ${user.status === 'Active' ? 'fa-ban' : 'fa-rotate-left'} text-[10px]`}></i>
 </button>
 </div>
 </div>
 </div>
 ))}
 {!isLoading && currentList.length === 0 && (
 <div className="py-10 text-center text-themeTextSec opacity-70 font-bold text-xs">
 No users found matching your criteria.
 </div>
 )}
 </div>
 </div>
 </div>

 {/* 3. PROVISIONING WIZARD MODAL */}
 {showProvisionModal && createPortal(
    <div className="fixed inset-0 z-[200] bg-themeApp animate-fade-in flex flex-col">
        
        <UserProvisioningHub 
            onClose={() => setShowProvisionModal(false)} 
            provisionClient={provisionClient} 
            onProvisioned={() => {
                fetchDirectory();
            }} 
        />
    </div>,
    document.body
 )}


 {/* 4. ADMIN QUESTIONNAIRE OVERRIDE MODAL */}
 {selectedQuestionnaireUser && (
 <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
 <div className={`w-full max-w-lg bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
 <div className="p-6 border-b border-themeBorder flex justify-between items-center bg-themeElevated dark:bg-themeApp">
 <div>
 <h3 className={`font-bold tracking-tight text-lg text-themeText `}>Edit Questionnaire Data</h3>
 <p className="text-xs text-themeTextSec font-medium mt-1">For: {selectedQuestionnaireUser.name} ({selectedQuestionnaireUser.id})</p>
 </div>
 <button type="button" onClick={() => setSelectedQuestionnaireUser(null)} className="w-8 h-8 rounded-full bg-themeApp text-themeTextSec hover:text-themeText flex items-center justify-center border border-themeBorder dark:border-white/[0.08] transition-colors">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar bg-themeApp">
 {selectedQuestionnaireUser.role === 'faculty' && facultyProfileData ? (
 <div className="flex flex-col gap-4">
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Public Display (Website)</label>
 <select value={facultyProfileData.is_public ? 'true' : 'false'} onChange={e => setFacultyProfileData({...facultyProfileData, is_public: e.target.value === 'true'})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3 text-xs font-bold text-themeText outline-none">
 <option value="true">Visible on Website</option>
 <option value="false">Hidden from Website</option>
 </select>
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Designation</label>
 <input type="text" value={facultyProfileData.designation || ''} onChange={e => setFacultyProfileData({...facultyProfileData, designation: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Biography / About</label>
 <textarea rows="4" value={facultyProfileData.bio || ''} onChange={e => setFacultyProfileData({...facultyProfileData, bio: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3 text-xs font-medium text-themeText outline-none focus:border-themeBorder Accent transition-colors custom-scrollbar resize-none" placeholder="Detailed bio..."></textarea>
 </div>
 </div>
) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Legal Interest</label>
 <input type="text" value={qFormData.legalInterest || ''} onChange={e => setQFormData({...qFormData, legalInterest: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Blood Group</label>
 <input type="text" value={qFormData.bloodGroup || ''} onChange={e => setQFormData({...qFormData, bloodGroup: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Aadhar Number</label>
 <input type="text" value={qFormData.aadharNumber || ''} onChange={e => setQFormData({...qFormData, aadharNumber: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Past Legal Gens</label>
 <input type="text" value={qFormData.pastLegalGenerations || ''} onChange={e => setQFormData({...qFormData, pastLegalGenerations: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Father's Name</label>
 <input type="text" value={qFormData.fatherName || ''} onChange={e => setQFormData({...qFormData, fatherName: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Mother's Name</label>
 <input type="text" value={qFormData.motherName || ''} onChange={e => setQFormData({...qFormData, motherName: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 </div>
)}

 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Present Address</label>
 <textarea rows="2" value={qFormData.presentAddress || ''} onChange={e => setQFormData({...qFormData, presentAddress: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors resize-none" />
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Permanent Address</label>
 <textarea rows="2" value={qFormData.permanentAddress || ''} onChange={e => setQFormData({...qFormData, permanentAddress: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors resize-none" />
 </div>

 {selectedQuestionnaireUser.role === 'faculty' && facultyProfileData ? (
 <div className="flex flex-col gap-4">
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Public Display (Website)</label>
 <select value={facultyProfileData.is_public ? 'true' : 'false'} onChange={e => setFacultyProfileData({...facultyProfileData, is_public: e.target.value === 'true'})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3 text-xs font-bold text-themeText outline-none">
 <option value="true">Visible on Website</option>
 <option value="false">Hidden from Website</option>
 </select>
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Designation</label>
 <input type="text" value={facultyProfileData.designation || ''} onChange={e => setFacultyProfileData({...facultyProfileData, designation: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Biography / About</label>
 <textarea rows="4" value={facultyProfileData.bio || ''} onChange={e => setFacultyProfileData({...facultyProfileData, bio: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3 text-xs font-medium text-themeText outline-none focus:border-themeBorder Accent transition-colors custom-scrollbar resize-none" placeholder="Detailed bio..."></textarea>
 </div>
 </div>
) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Legal Interest</label>
 <input type="text" value={qFormData.legalInterest || ''} onChange={e => setQFormData({...qFormData, legalInterest: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Blood Group</label>
 <input type="text" value={qFormData.bloodGroup || ''} onChange={e => setQFormData({...qFormData, bloodGroup: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Aadhar Number</label>
 <input type="text" value={qFormData.aadharNumber || ''} onChange={e => setQFormData({...qFormData, aadharNumber: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Past Legal Gens</label>
 <input type="text" value={qFormData.pastLegalGenerations || ''} onChange={e => setQFormData({...qFormData, pastLegalGenerations: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Father's Name</label>
 <input type="text" value={qFormData.fatherName || ''} onChange={e => setQFormData({...qFormData, fatherName: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] text-themeTextSec tracking-normal font-bold ml-1">Mother's Name</label>
 <input type="text" value={qFormData.motherName || ''} onChange={e => setQFormData({...qFormData, motherName: e.target.value})} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeBorder Accent transition-colors" />
 </div>
 </div>
)}
 </div>
 <div className="p-5 border-t border-themeBorder bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] flex justify-end gap-3 shrink-0">
 <button type="button" onClick={() => setSelectedQuestionnaireUser(null)} className="px-6 py-3 bg-themeElevated dark:bg-themeApp hover:bg-themeBorder text-themeTextSec hover:text-themeText rounded-2xl text-[13px] font-medium transition-colors border border-themeBorder dark:border-white/[0.08]">Cancel</button>
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

 {transferModalState.isOpen && transferModalState.sourceUser && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
 <div className="bg-themePanel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-themeBorder dark:border-white/[0.08] flex flex-col animate-scale-up">
 <div className="p-6 border-b border-themeBorder dark:border-white/[0.05] relative">
 <h3 className="text-lg font-black text-themeText tracking-tight">Transfer Faculty Workload</h3>
 <p className="text-xs text-themeTextSec mt-1">
 {transferModalState.sourceUser.name} is currently assigned to <strong>{transferModalState.subjects} subjects</strong> and <strong>{transferModalState.classes} classes</strong>.
 </p>
 <p className="text-[10px] text-themeAccent dark:text-themeAccent mt-2 bg-themeApp dark:bg-themeAccent/10 p-2 rounded-lg border border-themeAccent/20">
 <strong>Important:</strong> Transferring workload will permanently merge these classes into the target faculty's schedule. If you are hiring a dedicated replacement later, it is recommended to cancel this and leave the workload on this deactivated account, then transfer directly to the new hire when they join.
 </p>
 <button onClick={() => setTransferModalState({ ...transferModalState, isOpen: false })} className="absolute top-6 right-6 text-themeTextSec hover:text-themeText transition-colors">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 
 <div className="p-6 flex flex-col gap-4 bg-black/[0.02] /20">
 <label className="text-[11px] font-black tracking-widest text-themeTextSec uppercase">Select Substitute Faculty</label>
 <select
 value={transferModalState.selectedTarget}
 onChange={(e) => setTransferModalState({ ...transferModalState, selectedTarget: e.target.value })}
 className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-blue-500 transition-colors"
 >
 <option value="" disabled>Select a faculty member...</option>
 {usersData.faculty
 .filter(f => f.status === 'Active' && f.db_id !== transferModalState.sourceUser.db_id)
 .map(f => (
 <option key={f.db_id} value={f.db_id}>{f.name} ({f.id})</option>
 ))
 }
 </select>
 </div>
 
 <div className="p-6 border-t border-themeBorder dark:border-white/[0.05] flex justify-between gap-3 bg-themePanel">
 <div className="flex gap-3">
 {transferModalState.isDeactivating && (
 <>
 <button 
 onClick={() => executeSuspension(transferModalState.sourceUser)}
 className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-themeApp transition-colors flex items-center gap-2"
 >
 <i className="fa-solid fa-ban"></i> Suspend
 </button>
 <button 
 onClick={() => executeDeletion(transferModalState.sourceUser)}
 className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors flex items-center gap-2"
 >
 <i className="fa-solid fa-trash-can"></i> Delete
 </button>
 </>
 )}
 </div>
 <div className="flex gap-3">
 <button 
 onClick={() => setTransferModalState({ ...transferModalState, isOpen: false })}
 className="px-5 py-2.5 rounded-xl font-semibold text-xs text-themeTextSec hover:text-themeText hover:bg-themeElevated transition-colors"
 >
 Cancel
 </button>
 <button 
 onClick={handleWorkloadTransferSubmit}
 disabled={!transferModalState.selectedTarget}
 className="px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-500 hover:bg-blue-600 text-themeApp disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
 >
 <i className="fa-solid fa-exchange-alt"></i>
 Transfer Workload
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}