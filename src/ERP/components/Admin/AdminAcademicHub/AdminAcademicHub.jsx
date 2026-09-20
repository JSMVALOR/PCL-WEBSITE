import { supabase } from "../../../../Shared/lib/supabase/supabaseClient";


/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminAcademicHub() {

    useEffect(() => {
        const wireDataAsAdmin = async () => {
            if (localStorage.getItem('admin_wired_dataset_v3')) return;
            console.log("Admin Auto-wiring Dataset...");
            try {
                // 1. Get LLB Batch
                const { data: batches } = await supabase.from('academic_batches').select('id').ilike('name', '%LLB (Class of 2029)%').limit(1);
                const batchId = batches?.[0]?.id;
                if (!batchId) return;

                // 2. Get Faculties
                const { data: faculties } = await supabase.from('profiles').select('id').eq('role', 'faculty');
                if (!faculties || faculties.length === 0) return;

                // 3. Get Subjects
                const { data: subjects } = await supabase.from('master_subjects').select('id, code').ilike('code', '%LLB 10%');
                if (!subjects || subjects.length === 0) return;
                
                const sub1 = subjects.find(s => s.code.includes('102'))?.id || subjects[0].id;
                const sub2 = subjects.find(s => s.code.includes('103'))?.id || subjects[0].id;
                const sub3 = subjects.find(s => s.code.includes('104'))?.id || subjects[0].id;

                // 4. Assign ALL faculties to these subjects for this batch
                const cohortInserts = [];
                faculties.forEach(f => {
                    cohortInserts.push({ batch_id: batchId, faculty_id: f.id, master_subject_id: sub1 });
                    cohortInserts.push({ batch_id: batchId, faculty_id: f.id, master_subject_id: sub2 });
                    cohortInserts.push({ batch_id: batchId, faculty_id: f.id, master_subject_id: sub3 });
                });

                // Ignore errors for duplicates
                await supabase.from('cohort_subjects').upsert(cohortInserts, { onConflict: 'batch_id, faculty_id, master_subject_id', ignoreDuplicates: true });

                localStorage.setItem('admin_wired_dataset_v3', 'true');
                if (window.erpDialog) window.erpDialog.alert("Dataset successfully wired by Admin!");
                else alert("Dataset successfully wired by Admin!");
            } catch (err) {
                console.error(err);
            }
        };
        wireDataAsAdmin();
    }, []);

    const navigate = useNavigate();

    const cards = [{"id": "coursebuilder", "title": "Course Builder", "icon": "fa-book-open", "desc": "Manage semesters, subjects, and Bar compliance."} , {"id": "timetablebuilder", "title": "Timetable Builder", "icon": "fa-calendar-days", "desc": "Manually schedule classes and auto-generate grids."}, {"id": "allocations", "title": "Mentorship", "icon": "fa-people-arrows", "desc": "Allocate faculty mentors to students."}, {"id": "markscontroller", "title": "Marks Dispatcher", "icon": "fa-file-signature", "desc": "OU Internal marks tracking and CSV exports."}];

    return (
        <div className="w-full animate-fade-in selection:bg-[#007AFF]/20 min-h-screen bg-transparent text-themeText dark:text-themeText">
            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
                <PageHeader 
                    icon="fa-solid fa-graduation-cap" 
                    title="Academic Center" 
                    subtitle="Global management for curriculum, exams, and mentorship." 
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {cards.map(card => (
                        <div 
                            key={card.id}
                            onClick={() => navigate(`/admin/${card.id}`)}
                            className="bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] p-6 lg:p-8 rounded-[1.5rem] hover:-translate-y-1 hover:shadow-lg transition duration-300 group flex flex-col gap-4 cursor-pointer shadow-none shadow-none"
                        >
                            <div className="w-12 h-12 rounded-[1rem] bg-[#007AFF]/10 flex items-center justify-center border border-[#007AFF]/20 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <i className={`fa-solid ${card.icon} text-themeAccent text-xl`}></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight text-themeText dark:text-themeText mb-1">{card.title}</h3>
                                <p className="text-xs font-medium text-themeTextSec leading-relaxed">{card.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
