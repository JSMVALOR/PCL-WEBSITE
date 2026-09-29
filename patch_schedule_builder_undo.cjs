const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx';
let content = fs.readFileSync(file, 'utf8');

const shuffleAndSwap = `
 const handleShuffleGrid = async () => {
    if (schedule.length === 0) return window.erpDialog?.alert("No classes in the grid to shuffle.");
    if (!(await window.erpDialog?.confirm("Are you sure you want to magically shuffle all classes in this grid? This will randomly rearrange the current subjects across the existing time slots for this batch.", "Shuffle Grid"))) return;

    setLoading(true);
    try {
        const slots = schedule.map(s => ({ id: s.raw.id }));
        const contents = schedule.map(s => ({ master_subject_id: s.raw.master_subject_id, faculty_id: s.raw.faculty_id }));

        // Backup original state for undo
        const originalUpdates = slots.map((slot, idx) => ({
            id: slot.id,
            master_subject_id: contents[idx].master_subject_id,
            faculty_id: contents[idx].faculty_id
        }));

        for (let i = contents.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [contents[i], contents[j]] = [contents[j], contents[i]];
        }

        const updates = slots.map((slot, idx) => ({
            id: slot.id,
            master_subject_id: contents[idx].master_subject_id,
            faculty_id: contents[idx].faculty_id
        }));

        const { error } = await supabase.from('class_schedule').upsert(updates);
        if (error) throw error;
        
        fetchData();

        if (window.erpToast?.undoable) {
            window.erpToast.undoable(
                "Grid magically shuffled! ✨",
                () => {},
                async () => {
                    await supabase.from('class_schedule').upsert(originalUpdates);
                    fetchData();
                    window.erpToast.show("Shuffle undone. Grid restored.", "success");
                }
            );
        } else if (window.erpToast) {
            window.erpToast.show("Grid shuffled successfully!", "success");
        }
    } catch (err) {
        if (window.erpToast) window.erpToast.show("Failed to shuffle grid: " + err.message, "error");
        setLoading(false);
    }
 };

 const handleSlotSwap = async (draggedId, targetDay, targetStart, targetEnd) => {
    const draggedClass = schedule.find(s => s.id === draggedId || (s.raw && s.raw.id === draggedId));
    if (!draggedClass) return;

    // Find if target slot is occupied
    const targetClass = schedule.find(c => {
        if (c.day !== targetDay) return false;
        return (c.time >= targetStart && c.time < targetEnd) || (c.time <= targetStart && c.endTime > targetStart);
    });

    if (targetClass && targetClass.id === draggedClass.id) return; // Same slot

    try {
        const updates = [];
        const originalUpdates = [];

        if (targetClass) {
            // Swap
            updates.push({ id: draggedClass.raw.id, day_of_week: targetClass.raw.day_of_week, start_time: targetClass.raw.start_time, end_time: targetClass.raw.end_time });
            updates.push({ id: targetClass.raw.id, day_of_week: draggedClass.raw.day_of_week, start_time: draggedClass.raw.start_time, end_time: draggedClass.raw.end_time });
            
            originalUpdates.push({ id: draggedClass.raw.id, day_of_week: draggedClass.raw.day_of_week, start_time: draggedClass.raw.start_time, end_time: draggedClass.raw.end_time });
            originalUpdates.push({ id: targetClass.raw.id, day_of_week: targetClass.raw.day_of_week, start_time: targetClass.raw.start_time, end_time: targetClass.raw.end_time });
        } else {
            // Move
            updates.push({ id: draggedClass.raw.id, day_of_week: targetDay, start_time: targetStart + ':00', end_time: targetEnd + ':00' });
            originalUpdates.push({ id: draggedClass.raw.id, day_of_week: draggedClass.raw.day_of_week, start_time: draggedClass.raw.start_time, end_time: draggedClass.raw.end_time });
        }

        const { error } = await supabase.from('class_schedule').upsert(updates);
        if (error) throw error;
        
        fetchData();

        if (window.erpToast?.undoable) {
            window.erpToast.undoable(
                targetClass ? "Classes interchanged." : "Class moved.",
                () => {},
                async () => {
                    await supabase.from('class_schedule').upsert(originalUpdates);
                    fetchData();
                    window.erpToast.show("Move undone.", "success");
                }
            );
        }
    } catch (err) {
        if (window.erpToast) window.erpToast.show("Failed to move class.", "error");
    }
 };
`;

content = content.replace(/const handleShuffleGrid = async \(\) => \{[\s\S]*? \};\n/, shuffleAndSwap);

content = content.replace(/<WeeklyChart schedule=\{/g, '<WeeklyChart onSlotSwap={handleSlotSwap} schedule={');

fs.writeFileSync(file, content);
