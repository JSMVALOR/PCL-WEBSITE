import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import SyllabusEditorModal from "../../Admin/AdminTimetableBuilder/tabs/components/SyllabusEditorModal";

export default function CourseVault({ isEmbedded = false }) {
    const { userSession } = useERP();
    const [materials, setMaterials] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    
    // State for viewing syllabus
    const [activeSyllabusSubject, setActiveSyllabusSubject] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchVaultData = async () => {
            try {
                // 1. Get batch UUID
                if (!userSession || !userSession.academic_batch) {
                    if (isMounted) setIsLoading(false);
                    return;
                }
                
                // Lookup batch_id (UUID) from academic_batches using string
                const { data: batchData } = await supabase.from('academic_batches').select('id').eq('name', userSession.academic_batch).single();
                if (!batchData || !batchData.id) {
                    if (isMounted) setIsLoading(false);
                    return;
                }
                const batchId = batchData.id;

                // 2. Fetch assigned cohort_subjects for this student's batch
                const { data: subjectData, error: subErr } = await supabase
                    .from('cohort_subjects')
                    .select('id, master_subjects(id, name, code, syllabus)')
                    .eq('batch_id', batchId);

                if (subErr) throw subErr;
                
                if (isMounted && subjectData) {
                    setSubjects(subjectData);
                }

                if (!subjectData || subjectData.length === 0) {
                    if (isMounted) setIsLoading(false);
                    return;
                }

                const subjectIds = subjectData.map(s => s.id);

                // 3. Fetch materials from course_resources
                const { data: resourceData, error: resErr } = await supabase
                    .from('course_resources')
                    .select('id, title, url, type, created_at, cohort_subject_id, profiles!faculty_id(full_name)')
                    .in('cohort_subject_id', subjectIds)
                    .order('created_at', { ascending: false });

                if (resErr) throw resErr;

                if (isMounted && resourceData) {
                    const enrichedMaterials = resourceData.map(res => {
                        const sub = subjectData.find(s => s.id === res.cohort_subject_id);
                        return {
                            ...res,
                            course_name: sub ? sub.master_subjects?.name : 'Unknown Course',
                            course_code: sub ? sub.master_subjects?.code : '',
                            faculty_name: res.profiles?.full_name || 'Faculty'
                        };
                    });
                    setMaterials(enrichedMaterials);
                }
            } catch (error) {
                console.error("Error fetching Course Vault data:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchVaultData();
        return () => { isMounted = false; };
    }, [userSession]);

    const getTypeIcon = (type) => {
        switch (type) {
            case "Drive Link": return "fa-brands fa-google-drive text-emerald-400";
            case "PDF Document": return "fa-solid fa-file-pdf text-rose-400";
            case "Video Lecture": return "fa-brands fa-youtube text-red-500";
            case "Web Resource": return "fa-solid fa-link text-blue-400";
            default: return "fa-solid fa-folder-open text-themeAccent";
        }
    };

    const getTypesList = () => {
        const types = new Set(materials.map(m => m.type));
        return ['All', ...Array.from(types)];
    };

    const filteredMaterials = activeFilter === "All" ? materials : materials.filter(m => m.type === activeFilter);

    // Group materials by subject ID so we can render empty states properly
    const materialsBySubject = filteredMaterials.reduce((acc, curr) => {
        if (!acc[curr.cohort_subject_id]) acc[curr.cohort_subject_id] = [];
        acc[curr.cohort_subject_id].push(curr);
        return acc;
    }, {});

    return (
        <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
            <div className={`w-full mx-auto flex flex-col gap-8 lg:gap-12 ${!isEmbedded ? "p-4 sm:p-6 lg:p-10 pb-32 lg:pb-16" : "pb-10"}`}>
                {/* SINGLE MASTER HEADER */}
                <PageHeader 
                    icon="fa-brands fa-google-drive" 
                    title="Course Vault & Syllabi" 
                    subtitle="Access official course materials, study links, and detailed syllabi." 
                    isEmbedded={isEmbedded}
                    rightContent={
                        materials.length > 0 && (
                            <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] rounded-2xl border border-black/10 dark:border-white/20 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar relative z-10">
                                {getTypesList().map((filter) => (
                                    <button type="button"
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`flex-1 lg:flex-none px-5 py-2.5 rounded-lg text-[13px] font-bold tracking-tight transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
                                            activeFilter === filter 
                                            ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#F2F2F7] shadow-sm' 
                                            : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'
                                        }`}
                                    >
                                        {filter === 'All' ? 'All Resources' : filter}
                                    </button>
                                ))}
                            </div>
                        )
                    }
                />

                {/* CONTENT GRID */}
                <div className="flex flex-col gap-8 animate-fade-in pb-12">
                    {isLoading ? (
                        <div className="flex flex-col gap-6 w-full animate-pulse opacity-70 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20"></div>
                                <div className="h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20"></div>
                                <div className="h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20"></div>
                            </div>
                            <div className="h-64 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 mt-4"></div>
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                            <i className={`fa-brands fa-google-drive text-4xl lg:text-5xl text-themeTextSec opacity-50 mb-4`}></i>
                            <h3 className={`font-bold text-xl lg:text-2xl text-[#1C1C1E] dark:text-[#F2F2F7] tracking-tight`}>No Courses Found</h3>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm mt-2 max-w-sm`}>You are not assigned to any courses yet.</p>
                        </div>
                    ) : (
                        subjects.map((sub) => {
                            const items = materialsBySubject[sub.id] || [];
                            const masterSubject = sub.master_subjects;
                            if (!masterSubject) return null;
                            const hasSyllabus = masterSubject.syllabus && Object.keys(masterSubject.syllabus).length > 0;

                            return (
                                <div key={sub.id} className="flex flex-col gap-5 bg-black/[0.02] dark:bg-white/[0.02] p-6 rounded-3xl border border-black/5 dark:border-white/5">
                                    
                                    <div className="flex items-start lg:items-center justify-between gap-4 border-b-theme border-black/5 dark:border-white/10 pb-4 flex-col lg:flex-row">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 flex items-center justify-center border border-[#007AFF]/20 shrink-0">
                                                <i className="fa-solid fa-folder-open text-[#007AFF] text-lg"></i>
                                            </div>
                                            <div>
                                                <h3 className={`font-bold tracking-tight text-lg lg:text-xl text-[#1C1C1E] dark:text-[#F2F2F7] leading-none mb-1`}>
                                                    {masterSubject.name}
                                                </h3>
                                                <span className="text-[11px] font-bold tracking-tight text-[#8E8E93]">{masterSubject.code}</span>
                                            </div>
                                        </div>
                                        
                                        {hasSyllabus && (
                                            <button 
                                                onClick={() => setActiveSyllabusSubject(masterSubject)}
                                                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl transition flex items-center gap-2"
                                            >
                                                <i className="fa-solid fa-book-open"></i> View Syllabus
                                            </button>
                                        )}
                                    </div>

                                    {items.length === 0 ? (
                                        <div className="text-sm font-medium text-[#8E8E93] py-4 italic text-center">
                                            No materials published yet.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {items.map(item => (
                                                <a 
                                                    key={item.id} 
                                                    href={item.url} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    onClick={(e) => handleResourceClick(e, item)}
                                                    className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] p-5 rounded-[1.5rem] hover:-translate-y-1 hover:shadow-lg transition group flex flex-col justify-between min-h-[140px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] cursor-pointer"
                                                >
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border border-black/5 dark:border-white/10 bg-white/5 group-hover:scale-110 transition-transform origin-left ${getTypeIcon(item.type).split(' ').slice(2).join(' ')}`}>
                                                                <i className={`${getTypeIcon(item.type).split(' ')[0]} ${getTypeIcon(item.type).split(' ')[1]}`}></i>
                                                            </div>
                                                            <div className="bg-black/5 dark:bg-white/10 px-2 py-1 rounded text-[10px] font-bold tracking-tight text-[#8E8E93] border border-black/5 dark:border-white/5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                                                                {item.type}
                                                            </div>
                                                        </div>
                                                        <h4 className="text-sm font-bold text-themeText group-hover:text-themeAccent transition-colors leading-snug line-clamp-2">
                                                            {item.title}
                                                        </h4>
                                                    </div>
                                                    
                                                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] font-bold text-[#8E8E93] tracking-tight">
                                                        <span><i className="fa-solid fa-user-tie mr-1"></i> {item.faculty_name.split(' ')[0]}</span>
                                                        <span>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            );
                        })
                    )}
                </div>

                {previewUrl && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8">
                    <div className="w-full max-w-5xl h-[85vh] bg-themeApp rounded-3xl overflow-hidden flex flex-col relative border border-white/10 shadow-2xl">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                            <h3 className="text-sm font-black tracking-tight text-themeText flex items-center gap-2">
                                <i className="fa-brands fa-google-drive text-blue-500"></i> Document Preview
                            </h3>
                            <button onClick={() => setPreviewUrl(null)} className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <iframe src={previewUrl} className="w-full flex-1 border-none bg-white"></iframe>
                    </div>
                </div>
            )}
            
            {activeSyllabusSubject && (
                    <SyllabusEditorModal
                        subject={activeSyllabusSubject}
                        onClose={() => setActiveSyllabusSubject(null)}
                        isReadOnly={true}
                    />
                )}
            </div>
        </div>
    );
}