import re

with open('src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'r') as f:
    content = f.read()

# 1. Update the fetch metadata for subjects to include academic_batches(batch_name)
old_fetch = "await supabase.from('cohort_subjects').select('id, batch_id, master_subjects(id, name, code)').eq('faculty_id', userSession.db_id);"
new_fetch = "await supabase.from('cohort_subjects').select('id, batch_id, academic_batches(batch_name), master_subjects(id, name, code)').eq('faculty_id', userSession.db_id);"
content = content.replace(old_fetch, new_fetch)

# 2. Update the subs mapping
old_subs_map = "const subs = rawSubs ? rawSubs.map(s => ({ id: s.id, master_id: s.master_subjects?.id, name: s.master_subjects?.name || 'Unknown', code: s.master_subjects?.code || 'Unknown' })) : [];"
new_subs_map = "const subs = rawSubs ? rawSubs.map(s => ({ id: s.id, master_id: s.master_subjects?.id, name: s.master_subjects?.name || 'Unknown', code: s.master_subjects?.code || 'Unknown', batch_name: s.academic_batches?.batch_name })) : [];"
content = content.replace(old_subs_map, new_subs_map)

# 3. Update the useEffect for subjectContext
old_effect = """    // When subjectContext changes, auto-select it and its batches
    useEffect(() => {
        if (subjectContext) {
            setSelectedSubject(subjectContext.id);
            const subjSchedule = facultySchedule.filter(s => s.subject_id === subjectContext.id);
            const uniqueBatches = [...new Set(subjSchedule.map(s => s.batch).filter(Boolean))];
            setAvailableBatches(uniqueBatches);
            if (uniqueBatches.length === 1) setSelectedBatch(uniqueBatches[0]);
            else if (!uniqueBatches.includes(selectedBatch)) setSelectedBatch("");
        } else {
            setSelectedSubject("");
            setAvailableBatches([]);
            setSelectedBatch("");
        }
    }, [subjectContext, facultySchedule]);"""

new_effect = """    // When subjectContext changes, auto-select it and its batches
    useEffect(() => {
        if (subjectContext) {
            const masterId = subjectContext.master_subjects?.id || subjectContext.master_subjects_id || subjectContext.subject_id || subjectContext.id;
            setSelectedSubject(masterId);
            
            // Find the batch from our subjects list
            const matchedSub = subjects.find(s => s.master_id === masterId || s.id === masterId);
            if (matchedSub && matchedSub.batch_name) {
                setAvailableBatches([matchedSub.batch_name]);
                setSelectedBatch(matchedSub.batch_name);
            } else {
                const subjSchedule = facultySchedule.filter(s => s.subject_id === masterId);
                const uniqueBatches = [...new Set(subjSchedule.map(s => s.batch).filter(Boolean))];
                setAvailableBatches(uniqueBatches);
                if (uniqueBatches.length > 0) setSelectedBatch(uniqueBatches[0]);
            }
        } else {
            setSelectedSubject("");
            setAvailableBatches([]);
            setSelectedBatch("");
        }
    }, [subjectContext, facultySchedule, subjects]);"""
content = content.replace(old_effect, new_effect)

# 4. Hide the dropdown if subjectContext exists
old_dropdown = """                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-medium text-themeTextSec">Target Batch</label>
                                <div className="relative"><select 
                                    className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
                                    value={selectedBatch}
                                    onChange={(e) => { setSelectedBatch(e.target.value); setSelectedAssessmentType(""); }}
                                >
                                    <option value="" disabled>Select Batch</option>
                                    {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select><i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec pointer-events-none text-xs"></i></div>
                            </div>"""

new_dropdown = """                            {!subjectContext && (
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-medium text-themeTextSec">Target Batch</label>
                                <div className="relative"><select 
                                    className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
                                    value={selectedBatch}
                                    onChange={(e) => { setSelectedBatch(e.target.value); setSelectedAssessmentType(""); }}
                                >
                                    <option value="" disabled>Select Batch</option>
                                    {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select><i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec pointer-events-none text-xs"></i></div>
                            </div>
                            )}"""
content = content.replace(old_dropdown, new_dropdown)

with open('src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'w') as f:
    f.write(content)
