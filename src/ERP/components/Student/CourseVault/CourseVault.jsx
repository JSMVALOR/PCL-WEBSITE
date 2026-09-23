import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
    const [semesterFilter, setSemesterFilter] = useState("current"); // all, current, previous
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name_asc"); // name_asc, name_desc, code_asc
    const [previewUrl, setPreviewUrl] = useState(null);
    const [activeMaterialsSubject, setActiveMaterialsSubject] = useState(null);

    const handleResourceClick = (e, item) => {
        if (item.url && item.url.includes('drive.google.com/file/d/')) {
            e.preventDefault();
            const match = item.url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                setPreviewUrl(`https://drive.google.com/file/d/${match[1]}/preview`);
            } else {
                window.open(item.url, '_blank');
            }
        }
    };
    
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
                
                // Lookup batch_id and program_id from academic_batches
                const { data: batchData } = await supabase.from('academic_batches').select('id, program_id').eq('name', userSession.academic_batch).single();
                if (!batchData || !batchData.id) {
                    if (isMounted) setIsLoading(false);
                    return;
                }
                const batchId = batchData.id;
                const programId = batchData.program_id;

                // 2. Fetch all master_subjects for this program (if programId exists)
                let allMasterSubjects = [];
                if (programId) {
                    const { data: mData, error: masterErr } = await supabase
                        .from('master_subjects')
                        .select('id, name, code, syllabus, target_semester')
                        .eq('program_id', programId);
                    if (!masterErr && mData) allMasterSubjects = mData;
                }

                // 3. Fetch assigned cohort_subjects for this student's batch
                const { data: cohortSubjectsData, error: subErr } = await supabase
                    .from('cohort_subjects')
                    .select('id, master_subject_id, master_subjects(id, name, code, syllabus, target_semester)')
                    .eq('batch_id', batchId);

                if (subErr) throw subErr;

                // Create a unified subjects map by master_subject id to remove duplicates
                const unifiedSubjectsMap = new Map();
                
                // Add assigned subjects first
                if (cohortSubjectsData) {
                    cohortSubjectsData.forEach(cs => {
                        if (cs.master_subjects) {
                            unifiedSubjectsMap.set(cs.master_subjects.id, {
                                id: cs.id, // cohort_subject.id
                                master_subjects: cs.master_subjects,
                                _isAssigned: true,
                                _cohortSubjectId: cs.id
                            });
                        }
                    });
                }

                // Add unassigned master subjects
                if (allMasterSubjects) {
                    allMasterSubjects.forEach(ms => {
                        if (!unifiedSubjectsMap.has(ms.id)) {
                            unifiedSubjectsMap.set(ms.id, {
                                id: `unassigned-${ms.id}`,
                                master_subjects: ms,
                                _isAssigned: false,
                                _cohortSubjectId: null
                            });
                        }
                    });
                }

                const unifiedSubjects = Array.from(unifiedSubjectsMap.values());

                if (isMounted) {
                    setSubjects(unifiedSubjects);
                }

                if (unifiedSubjects.length === 0) {
                    if (isMounted) setIsLoading(false);
                    return;
                }

                const assignedSubjectIds = cohortSubjectsData ? cohortSubjectsData.map(s => s.id) : [];

                // 4. Fetch materials from course_resources
                const { data: resourceData, error: resErr } = await supabase
                    .from('course_resources')
                    .select('id, title, url, type, created_at, cohort_subject_id, profiles!faculty_id(full_name)')
                    .in('cohort_subject_id', assignedSubjectIds.length > 0 ? assignedSubjectIds : ['00000000-0000-0000-0000-000000000000'])
                    .order('created_at', { ascending: false });

                if (resErr) throw resErr;

                if (isMounted && resourceData) {
                    const enrichedMaterials = resourceData.map(res => {
                        const sub = unifiedSubjects.find(s => s._cohortSubjectId === res.cohort_subject_id);
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

    let processedSubjects = subjects.map(s => ({ ...s, _isFaded: !s._isAssigned }));

    // Semester Filter (Hide instead of fade)
    if (semesterFilter === "current" && userSession?.semester) {
        processedSubjects = processedSubjects.filter(s => s.master_subjects?.target_semester === parseInt(userSession.semester));
    } else if (semesterFilter === "previous" && userSession?.semester) {
        processedSubjects = processedSubjects.filter(s => s.master_subjects?.target_semester < parseInt(userSession.semester));
    }

    // Search (Hide entirely)
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        processedSubjects = processedSubjects.filter(s => 
            s.master_subjects?.name?.toLowerCase().includes(q) || 
            s.master_subjects?.code?.toLowerCase().includes(q)
        );
    }

    // Sort
    if (sortBy === "name_asc") {
        processedSubjects.sort((a, b) => (a.master_subjects?.name || "").localeCompare(b.master_subjects?.name || ""));
    } else if (sortBy === "name_desc") {
        processedSubjects.sort((a, b) => (b.master_subjects?.name || "").localeCompare(a.master_subjects?.name || ""));
    } else if (sortBy === "code_asc") {
        processedSubjects.sort((a, b) => (a.master_subjects?.code || "").localeCompare(b.master_subjects?.code || ""));
    }

    // Group materials by subject ID
    const materialsBySubject = filteredMaterials.reduce((acc, curr) => {
        if (!acc[curr.cohort_subject_id]) acc[curr.cohort_subject_id] = [];
        acc[curr.cohort_subject_id].push(curr);
        return acc;
    }, {});

    // Resource Filter (Fade instead of hide)
    if (activeFilter !== "All") {
        processedSubjects.forEach(s => {
            if (!materialsBySubject[s.id] || materialsBySubject[s.id].length === 0) {
                s._isFaded = true;
            }
        });
    }

    return (
        <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
            <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-8 lg:gap-12 ${!isEmbedded ? "p-4 sm:p-6 lg:p-10 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
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
                                            ? 'bg-white dark:bg-themeElevated text-themeText dark:text-themeText shadow-sm' 
                                            : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'
                                        }`}
                                    >
                                        {filter === 'All' ? 'All Resources' : filter}
                                    </button>
                                ))}
                            </div>
                        )
                    }
                />

                {/* TOOLBAR */}
                {!isLoading && subjects.length > 0 && (
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-black/[0.02] dark:bg-white/[0.02] p-4 rounded-3xl border border-black/5 dark:border-white/5 animate-fade-in">
                        {/* Search Bar */}
                        <div className="relative w-full md:w-auto md:min-w-[280px]">
                            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-60"></i>
                            <input 
                                type="text"
                                placeholder="Search courses or codes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-themeText focus:border-[#007AFF]/50 focus:ring-2 focus:ring-[#007AFF]/20 outline-none transition-all placeholder:text-themeTextSec"
                            />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {/* Semester Toggle */}
                            <div className="flex p-1 bg-black/5 dark:bg-white/10 backdrop-blur-3xl rounded-xl border border-black/5 dark:border-white/10">
                                <button 
                                    onClick={() => setSemesterFilter("all")}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all ${semesterFilter === "all" ? "bg-white dark:bg-themeElevated text-themeText shadow-sm" : "text-themeTextSec hover:text-themeText"}`}
                                >
                                    All Semesters
                                </button>
                                <button 
                                    onClick={() => setSemesterFilter("current")}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all ${semesterFilter === "current" ? "bg-white dark:bg-themeElevated text-themeText shadow-sm" : "text-themeTextSec hover:text-themeText"}`}
                                >
                                    Current
                                </button>
                                <button 
                                    onClick={() => setSemesterFilter("previous")}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all ${semesterFilter === "previous" ? "bg-white dark:bg-themeElevated text-themeText shadow-sm" : "text-themeTextSec hover:text-themeText"}`}
                                >
                                    Previous
                                </button>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative flex-1 md:flex-none">
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full appearance-none bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-all cursor-pointer"
                                >
                                    <option value="name_asc">Course Name (A-Z)</option>
                                    <option value="name_desc">Course Name (Z-A)</option>
                                    <option value="code_asc">Course Code</option>
                                </select>
                                <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-themeTextSec pointer-events-none"></i>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENT GRID */}
                <div className="flex flex-col gap-12 animate-fade-in pb-12">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <div className="h-64 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 animate-pulse"></div>
                            <div className="h-64 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 animate-pulse hidden md:block"></div>
                            <div className="h-64 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 animate-pulse hidden lg:block"></div>
                        </div>
                    ) : processedSubjects.length === 0 ? (
                        <div className="col-span-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                            <i className={`fa-brands fa-google-drive text-4xl lg:text-5xl text-themeTextSec opacity-50 mb-4`}></i>
                            <h3 className={`font-bold text-xl lg:text-2xl text-themeText dark:text-themeText tracking-tight`}>No Courses Found</h3>
                            <p className="text-themeTextSec text-xs lg:text-sm mt-2 max-w-sm">No courses match your current filters.</p>
                        </div>
                    ) : (
                        Object.entries(
                            processedSubjects.reduce((acc, curr) => {
                                const sem = curr.master_subjects?.target_semester || 'Other';
                                if (!acc[sem]) acc[sem] = [];
                                acc[sem].push(curr);
                                return acc;
                            }, {})
                        )
                        .sort(([semA], [semB]) => {
                            if (semA === 'Other') return 1;
                            if (semB === 'Other') return -1;
                            return parseInt(semA) - parseInt(semB);
                        })
                        .map(([sem, semSubjects]) => (
                            <div key={sem} className="flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-lg font-black tracking-tight text-themeText dark:text-white">
                                        {sem === 'Other' ? 'Additional Courses' : `Semester ${sem}`}
                                    </h3>
                                    <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {semSubjects.map((sub) => {
                                        const items = materialsBySubject[sub.id] || [];
                                        const masterSubject = sub.master_subjects;
                                        if (!masterSubject) return null;
                                        const hasSyllabus = masterSubject.syllabus && Object.keys(masterSubject.syllabus).length > 0;

                                        return (
                                            <div key={sub.id} className={`flex flex-col bg-white/60 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 shadow-sm rounded-[2rem] transition-all hover:shadow-md hover:border-black/10 dark:hover:border-white/20 overflow-hidden ${sub._isFaded ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}>
                                                
                                                <div className="flex items-start justify-between gap-4 border-b border-black/5 dark:border-white/10 p-5 bg-black/[0.02] dark:bg-white/[0.02]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                                                            <i className="fa-solid fa-folder-open text-amber-500 text-lg"></i>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold tracking-tight text-sm text-themeText dark:text-white leading-tight mb-0.5 line-clamp-2">
                                                                {masterSubject.name}
                                                            </h3>
                                                            <span className="text-[9px] font-black tracking-widest uppercase text-themeTextSec">{masterSubject.code}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {hasSyllabus && (
                                                        <button 
                                                            onClick={() => setActiveSyllabusSubject(masterSubject)}
                                                            className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-themeTextSec hover:text-themeText dark:hover:text-white transition flex items-center justify-center shrink-0"
                                                            title="View Syllabus"
                                                        >
                                                            <i className="fa-solid fa-book-open text-xs"></i>
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="p-4 flex-1 flex flex-col">
                                                    <div className="flex-1 flex flex-col items-center justify-center py-8">
                                                        <button 
                                                            onClick={() => items.length > 0 && setActiveMaterialsSubject({ subject: masterSubject, items: items })}
                                                            disabled={items.length === 0}
                                                            className={`px-6 py-3 rounded-xl font-bold text-xs tracking-wide transition shadow-sm flex items-center gap-2 ${
                                                                items.length === 0 
                                                                ? 'bg-black/5 dark:bg-white/5 text-themeTextSec cursor-not-allowed opacity-70' 
                                                                : 'bg-themeAccent hover:bg-themeAccent/90 text-themeText active:scale-[0.98]'
                                                            }`}
                                                        >
                                                            <i className="fa-solid fa-layer-group"></i> 
                                                            {items.length === 0 ? (!sub._isAssigned ? "Course Not Active" : "No Materials Yet") : `View Materials (${items.length})`}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

            {previewUrl && createPortal(
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
                </div>,
                document.body
            )}
            
            
            {activeMaterialsSubject && createPortal(
                <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8 animate-fade-in">
                    <div className="w-full max-w-2xl max-h-[80vh] bg-themeApp rounded-3xl overflow-hidden flex flex-col relative border border-white/10 shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <i className="fa-solid fa-folder-open text-amber-500 text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-themeText dark:text-white leading-tight">
                                        {activeMaterialsSubject.subject.name}
                                    </h3>
                                    <span className="text-[10px] font-black tracking-widest uppercase text-themeTextSec">{activeMaterialsSubject.subject.code}</span>
                                </div>
                            </div>
                            <button onClick={() => setActiveMaterialsSubject(null)} className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 custom-scrollbar">
                            {activeMaterialsSubject.items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 opacity-50">
                                    <i className="fa-regular fa-folder-open text-4xl mb-4"></i>
                                    <p className="text-sm font-bold italic">No materials published yet.</p>
                                </div>
                            ) : (
                                activeMaterialsSubject.items.map(item => (
                                    <a 
                                        key={item.id} 
                                        href={item.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        onClick={(e) => handleResourceClick(e, item)}
                                        className="group bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 p-4 rounded-xl hover:bg-white dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/20 transition-all flex items-center gap-4 cursor-pointer"
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10 bg-white/5 group-hover:scale-110 transition-transform ${getTypeIcon(item.type).split(' ').slice(2).join(' ')}`}>
                                            <i className={`${getTypeIcon(item.type).split(' ')[0]} ${getTypeIcon(item.type).split(' ')[1]} text-lg`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-themeText dark:text-white group-hover:text-themeAccent transition-colors truncate">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1 text-[10px] font-black text-themeTextSec uppercase tracking-widest">
                                                <span>{item.type}</span>
                                                <span>•</span>
                                                <span>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <i className="fa-solid fa-arrow-up-right-from-square text-themeTextSec opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                    </a>
                                ))
                            )}
                        </div>
                    </div>
                </div>,
                document.body
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