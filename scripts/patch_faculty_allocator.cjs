const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/FacultyAllocator.jsx';
let content = fs.readFileSync(file, 'utf8');

const newHandleAssign = `
    const handleAssign = async (masterId, facultyId) => {
        if (!masterId) return;

        try {
            const existing = cohortSubjects.find(cs => cs.master_subject_id === masterId);
            const master = masterSubjects.find(s => s.id === masterId);
            const batch = batches.find(b => b.id === selectedBatchId);
            const newName = faculties.find(f => f.id === facultyId)?.full_name || 'Unassigned';
            
            // Backup the original faculty_id for undo purposes
            const originalFacultyId = existing ? existing.faculty_id : null;
            const originalExistingId = existing ? existing.id : null;

            // Confirmations
            if (facultyId && (!existing || existing.faculty_id !== facultyId)) {
                const confirmed = await window.erpDialog?.confirm(
                    \`You are about to formally bind \${newName} to \${master?.name}. This action will automatically update their academic dashboard and dispatch an official allocation notice. Proceed?\`, 
                    "Confirm Official Assignment"
                );
                
                if (!confirmed) {
                    setCohortSubjects([...cohortSubjects]);
                    return;
                }
            } else if (existing && !facultyId) {
                // If unassigning
                const confirmed = await window.erpDialog?.confirm(
                    \`Are you sure you want to completely unassign this subject? This might affect existing timetables.\`, 
                    "Revoke Assignment"
                );
                if (!confirmed) {
                    setCohortSubjects([...cohortSubjects]);
                    return;
                }
            }

            // Perform DB action
            if (existing) {
                if (!facultyId) {
                    const { error } = await supabase.from('cohort_subjects').delete().eq('id', existing.id);
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from('cohort_subjects').update({ faculty_id: facultyId }).eq('id', existing.id);
                    if (error) throw error;
                }
            } else if (facultyId) {
                const { error } = await supabase.from('cohort_subjects').insert([{
                    master_subject_id: masterId,
                    faculty_id: facultyId,
                    batch_id: selectedBatchId
                }]);
                if (error) throw error;
            }

            // Force completely fresh fetch
            const { data: freshData } = await supabase.from('cohort_subjects').select('*').eq('batch_id', selectedBatchId);
            setCohortSubjects(freshData || []);

            // Toasts and Undo
            if (!facultyId && existing) {
                // Unassigned
                if (window.erpToast?.undoable) {
                    window.erpToast.undoable(
                        \`Unassigned \${master?.name}.\`,
                        () => {},
                        async () => {
                            await supabase.from('cohort_subjects').insert([{
                                id: originalExistingId,
                                master_subject_id: masterId,
                                faculty_id: originalFacultyId,
                                batch_id: selectedBatchId
                            }]);
                            const { data: fData } = await supabase.from('cohort_subjects').select('*').eq('batch_id', selectedBatchId);
                            setCohortSubjects(fData || []);
                            window.erpToast.show(\`Restored \${master?.name} assignment.\`, "success");
                        }
                    );
                } else {
                    window.erpToast?.show(\`Unassigned \${master?.name} successfully.\`, "success");
                }
            } else if (facultyId) {
                // Assigned or Changed
                if (window.erpToast?.undoable && existing) {
                    window.erpToast.undoable(
                        \`Changed \${master?.name} to \${newName}.\`,
                        () => {},
                        async () => {
                            if (originalFacultyId) {
                                await supabase.from('cohort_subjects').update({ faculty_id: originalFacultyId }).eq('id', originalExistingId);
                            } else {
                                await supabase.from('cohort_subjects').delete().eq('master_subject_id', masterId).eq('batch_id', selectedBatchId);
                            }
                            const { data: fData } = await supabase.from('cohort_subjects').select('*').eq('batch_id', selectedBatchId);
                            setCohortSubjects(fData || []);
                            window.erpToast.show("Assignment change undone.", "success");
                        }
                    );
                } else {
                    window.erpToast?.show(\`Officially assigned \${newName} to \${master?.name}.\`, "success");
                }
            }

        } catch (err) {
            console.error("Assignment Error:", err);
            window.erpToast?.show(\`Failed to update allocation: \${err.message}\`, "error");
        }
    };
`;

content = content.replace(/const handleAssign = async \(masterId, facultyId\) => \{[\s\S]*?window\.erpDialog\?\.alert\(\`Failed to assign faculty: \$\{err\.message\}\`\);\n\s*\}\n\s*\};/, newHandleAssign.trim());

fs.writeFileSync(file, content);
