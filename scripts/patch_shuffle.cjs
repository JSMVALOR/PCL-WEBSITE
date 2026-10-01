const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx';
let content = fs.readFileSync(file, 'utf8');

const shuffleFunc = `
 const handleShuffleGrid = async () => {
    if (schedule.length === 0) return window.erpDialog?.alert("No classes in the grid to shuffle.");
    if (!(await window.erpDialog?.confirm("Are you sure you want to magically shuffle all classes in this grid? This will randomly rearrange the current subjects across the existing time slots for this batch.", "Shuffle Grid"))) return;

    setLoading(true);
    try {
        // 1. Get all occupied slots and all their contents
        const slots = schedule.map(s => ({ id: s.raw.id }));
        const contents = schedule.map(s => ({ master_subject_id: s.raw.master_subject_id, faculty_id: s.raw.faculty_id }));

        // 2. Shuffle contents array randomly
        for (let i = contents.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [contents[i], contents[j]] = [contents[j], contents[i]];
        }

        // 3. Assign shuffled contents back to slots
        const updates = slots.map((slot, idx) => ({
            id: slot.id,
            master_subject_id: contents[idx].master_subject_id,
            faculty_id: contents[idx].faculty_id
        }));

        // 4. Update database
        const { error } = await supabase.from('class_schedule').upsert(updates);
        if (error) throw error;
        
        if (window.erpDialog) window.erpDialog.alert("Grid shuffled successfully!", "Success", false);
        fetchData();
    } catch (err) {
        if (window.erpDialog) window.erpDialog.alert("Failed to shuffle grid: " + err.message, "Error", true);
        setLoading(false);
    }
 };

`;

// Insert it before the return
content = content.replace(/\n\s*return \(\n\s*<div className="flex flex-col gap-6 animate-fade-in/g, shuffleFunc + '\n return (\n <div className="flex flex-col gap-6 animate-fade-in');

// Add the button right before "Draw Mode"
const buttonCode = `
 <button type="button" 
 onClick={handleShuffleGrid} 
 className="px-5 py-2.5 rounded-xl text-[14px] font-medium tracking-normal transition whitespace-nowrap border bg-themeElevated/90 backdrop-blur-2xl border-black/5 dark:border-white/10 text-themeText hover:border-themeAccent hover:text-themeAccent"
 >
 <i className="fa-solid fa-shuffle mr-2"></i> Shuffle Grid
 </button>
`;

content = content.replace(/<button type="button" \n\s*onClick=\{\(\) => setIsDrawMode\(!isDrawMode\)\} /g, buttonCode + '\n <button type="button" \n onClick={() => setIsDrawMode(!isDrawMode)} ');

fs.writeFileSync(file, content);
