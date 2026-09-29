/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { sendSystemEmail } from '../../../lib/EmailService';
import { useERP } from "../../../context/ErpContext";

import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import PageHeader from "../../shared/PageHeader/PageHeader";




const getBatchColorKey = (batchName) => {
    if (!batchName) return 'default';
    const b = batchName.toUpperCase();
    if (b.includes('BA LLB')) return 'rose';
    if (b.includes('BBA LLB')) return 'emerald';
    if (b.includes('LLM')) return 'purple';
    if (b.includes('LLB')) return 'indigo';
    return 'default';
};

const THEME_COLORS = {
    blue: { primary: '#007AFF', bg: 'rgba(0,122,255,0.1)' },
    emerald: { primary: '#34C759', bg: 'rgba(52,199,89,0.1)' },
    amber: { primary: '#FF9500', bg: 'rgba(255,149,0,0.1)' },
    rose: { primary: '#FF3B30', bg: 'rgba(255,59,48,0.1)' },
    indigo: { primary: '#5856D6', bg: 'rgba(88,86,214,0.1)' },
    purple: { primary: '#AF52DE', bg: 'rgba(175,82,222,0.1)' },
    default: { primary: '#007AFF', bg: 'rgba(0,122,255,0.1)' }
};

export default function FacultyAssignments({ subjectContext, isEmbedded = false }) {
 const { userSession } = useERP();
 const [assignments, setAssignments] = useState(() => {
 const cached = sessionStorage.getItem(`fac_assignments_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });
 const [subjects, setSubjects] = useState(() => {
 const cached = sessionStorage.getItem(`fac_assign_subjects_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });

 // Form State
 const [showForm, setShowForm] = useState(false);
 const tColor = THEME_COLORS.amber; // Enforce premium amber aesthetic
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [formData, setFormData] = useState({
 id: null,
 subject_id: "",
 batch: "",
 title: "",
 description: "",
 total_marks: 100,
 due_date: "",
 submission_type: "offline",
 word_limit: 3000
 });

 // Batches logic
 const [facultySchedule, setFacultySchedule] = useState(() => {
 const cached = sessionStorage.getItem(`fac_assign_schedule_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });
 const [availableBatches, setAvailableBatches] = useState([]);

 useEffect(() => {
 fetchInitialData();
 }, [userSession]);

 // When subject changes, filter batches and auto-select if only one
 useEffect(() => {
 if (!formData.subject_id) {
 setAvailableBatches([]);
 setFormData(prev => ({ ...prev, batch: "" }));
 return;
 }
 
 const subjSchedule = facultySchedule.filter(s => s.subject_id === formData.subject_id);
 const uniqueBatches = [...new Set(subjSchedule.map(s => s.batch).filter(Boolean))];
 setAvailableBatches(uniqueBatches);
 
 // Auto-select if only 1 batch is mapped to this subject
 if (uniqueBatches.length === 1) {
 setFormData(prev => ({ ...prev, batch: uniqueBatches[0] }));
 } else if (!uniqueBatches.includes(formData.batch)) {
 setFormData(prev => ({ ...prev, batch: "" }));
 }
 }, [formData.subject_id, facultySchedule]);

 const fetchInitialData = async () => {
 if (!userSession?.db_id) return;
 try {
 // 1. Fetch Subjects assigned to this faculty (direct + schedule)
 const { data: directSubs } = await supabase.from('cohort_subjects').select('id, master_subjects(id, name, code)').eq('faculty_id', userSession.db_id);
 const { data: scheduledSubs } = await supabase.from('class_schedule').select('subject_id').eq('faculty_id', userSession.db_id);

 let allSubIds = (directSubs || []).map(s => s.id);
 if (scheduledSubs && scheduledSubs.length > 0) {
    allSubIds = [...new Set([...allSubIds, ...scheduledSubs.map(s => s.subject_id)])];
 }
 
 let finalSubs = directSubs || [];
 const missingIds = allSubIds.filter(id => !finalSubs.find(s => s.id === id));
 
 if (missingIds.length > 0) {
    const { data: extraSubs } = await supabase.from('cohort_subjects').select('id, master_subjects(id, name, code)').in('id', missingIds);
    if (extraSubs) {
        finalSubs = [...finalSubs, ...extraSubs];
    }
 }
 
 const subs = (finalSubs || []).map(cs => cs.master_subjects).filter(Boolean);
 // Remove duplicates
 const uniqueSubs = [];
 const seen = new Set();
 subs.forEach(s => {
     if (!seen.has(s.id)) {
         seen.add(s.id);
         uniqueSubs.push(s);
     }
 });
 
 
 if (uniqueSubs.length > 0) {
        setSubjects(uniqueSubs);
        sessionStorage.setItem(`fac_assign_subjects_${userSession.db_id}`, JSON.stringify(uniqueSubs));
    }

 // 2. Batches taught by this faculty (from class_schedule)
 const { data: schedule, error: schErr } = await supabase
 .from('class_schedule')
 .select('subject_id, batch')
 .in('subject_id', (uniqueSubs || []).map(s => s.id));
 
 if (schErr) throw schErr;
 if (schedule) {
 setFacultySchedule(schedule);
 sessionStorage.setItem(`fac_assign_schedule_${userSession.db_id}`, JSON.stringify(schedule));
 }

 // 3. Fetch all assignments created by this faculty
 const { data: assigns, error: assErr } = await supabase
 .from('assignments')
 .select('*, subject:subject_id(name, code)')
 .eq('faculty_id', userSession.db_id)
 .order('created_at', { ascending: false });
 
 if (assErr) throw assErr;
 if (assigns) {
 setAssignments(assigns);
 sessionStorage.setItem(`fac_assignments_${userSession.db_id}`, JSON.stringify(assigns));
 }

 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 };

 const handlePublish = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 let finalSubjectId = formData.subject_id;
    if (subjectContext) {
        if (subjectContext.master_subjects && typeof subjectContext.master_subjects === 'object' && subjectContext.master_subjects.id) {
            finalSubjectId = subjectContext.master_subjects.id;
        } else if (subjectContext.subject_id) {
            finalSubjectId = subjectContext.subject_id;
        } else if (subjectContext.master_subjects_id) {
            finalSubjectId = subjectContext.master_subjects_id;
        } else {
            finalSubjectId = subjectContext.id;
        }
    }
 const finalBatch = subjectContext ? (subjectContext.batches?.[0] || subjectContext.batch || "") : formData.batch;
 const finalBatchId = subjectContext ? subjectContext.batch_id : null;
 
 let error = null;
    if (formData.id) {
        const res = await supabase.from('assignments').update({
            title: formData.title,
            description: formData.description,
            total_marks: Number(formData.total_marks),
            due_date: formData.due_date,
            submission_type: formData.submission_type,
            word_limit: formData.submission_type === 'online' ? Number(formData.word_limit) : null,
            updated_at: new Date().toISOString()
        }).eq('id', formData.id);
        error = res.error;
    } else {
        const res = await supabase.from('assignments').insert({
            faculty_id: userSession.db_id,
            subject_id: finalSubjectId,
            batch: finalBatch,
            batch_id: finalBatchId,
            title: formData.title,
            description: formData.description,
            total_marks: Number(formData.total_marks),
            due_date: formData.due_date,
            submission_type: formData.submission_type,
            word_limit: formData.submission_type === 'online' ? Number(formData.word_limit) : null,
            status: 'active'
        });
        error = res.error;
    }


 if (error) throw error;
 
 // Fire ASSIGNMENT_PUBLISHED emails asynchronously
 (async () => {
   try {
     // Get subject name
     const subMatch = subjects.find(s => s.master_id === finalSubjectId || s.id === finalSubjectId);
     const subName = subMatch ? subMatch.name : 'Your Course';
     
     // Get students in this batch
     const { data: students } = await supabase.from('profiles').select('email').eq('role', 'student');
     // In a real scenario, we'd filter by batch. Here we just get all students for simplicity or filter if needed.
     
     // Send email notification (Note: email override will catch this)
     sendSystemEmail('ASSIGNMENT_PUBLISHED', {
         subject_name: subName,
         title: formData.title,
         deadline: formData.due_date,
         submission_mode: 'URL_ONLY',
         portal_link: window.location.origin + '/login'
     }).catch(e => console.error("Email dispatch failed", e));
   } catch (e) { console.error(e); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 })();

 
 setShowForm(false);
 setFormData({
 subject_id: "",
 batch: "",
 title: "",
 description: "",
 total_marks: 100,
 due_date: ""
 });
 fetchInitialData();
 
 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setIsSubmitting(false);
 }
 };

 const handleDelete = async (id) => {
 const confirmed = await window.erpDialog?.confirm("Are you sure you want to delete this assignment?");
 if (!confirmed) return;
 try {
 await supabase.from('assignments').delete().eq('id', id);
 setAssignments(prev => prev.filter(a => a.id !== id));
 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 };

    return (
        <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
            <div className={`w-full max-w-[1800px] mx-auto flex flex-col pb-10 lg:pb-10 xl:pb-8`}>
                
                {/* Header (Hidden if embedded or in subject context) */}
                {!subjectContext && (
    <div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">
        <PageHeader 
            icon="fa-solid fa-file-signature" 
            title="Assignment Engine" 
            subtitle="Manage offline submissions" 
        />
    </div>
 );
}