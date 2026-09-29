const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/SubjectBuilder.jsx';
let content = fs.readFileSync(file, 'utf8');

const newHandleDelete = `
    const handleDelete = async (id) => {
        // Find the subject before deleting so we can undo
        const sub = subjects.find(s => s.id === id);
        if (!sub) return;

        // Perform deletion
        await supabase.from('master_subjects').delete().eq('id', id);
        fetchData();

        // Show undoable toast
        if (window.erpToast?.undoable) {
            window.erpToast.undoable(
                \`Subject "\${sub.name}" deleted.\`,
                () => {}, // Execute is already done
                async () => {
                    // Undo function: re-insert the subject
                    await supabase.from('master_subjects').insert([{
                        id: sub.id,
                        code: sub.code,
                        name: sub.name,
                        credits: sub.credits,
                        target_semester: sub.target_semester,
                        theme_color: sub.theme_color,
                        program_id: sub.program_id,
                        syllabus: sub.syllabus
                    }]);
                    fetchData();
                    window.erpToast.show(\`Subject "\${sub.name}" restored.\`, 'success');
                }
            );
        } else if (window.erpToast) {
            window.erpToast.show("Subject deleted successfully.", "success");
        }
    };
`;

content = content.replace(/const handleDelete = async \(id\) => \{[\s\S]*?fetchData\(\);\n    \};/, newHandleDelete.trim());

fs.writeFileSync(file, content);
