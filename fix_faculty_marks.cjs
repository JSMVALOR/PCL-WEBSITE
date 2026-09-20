const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx';
let c = fs.readFileSync(p, 'utf8');

// Update the useEffect that handles subjectContext to automatically inherit batch and hide the dropdown
c = c.replace(
    /useEffect\(\(\) => \{\s*if \(subjectContext\) \{[\s\S]*?\} else \{[\s\S]*?\}\s*\}, \[subjectContext, facultySchedule\]\);/,
    `useEffect(() => {
        if (subjectContext) {
            setSelectedSubject(subjectContext.id);
            // SubjectContext represents a cohort_subject, so it already has a batch mapping
            const batch = subjectContext.batch_id || (subjectContext.batches && subjectContext.batches[0]);
            if (batch) {
                setAvailableBatches([batch]);
                setSelectedBatch(batch);
            } else {
                // Fallback to schedule if somehow batch is missing
                const subjSchedule = facultySchedule.filter(s => s.subject_id === subjectContext.id);
                const uniqueBatches = [...new Set(subjSchedule.map(s => s.batch).filter(Boolean))];
                setAvailableBatches(uniqueBatches);
                if (uniqueBatches.length === 1) setSelectedBatch(uniqueBatches[0]);
                else if (!uniqueBatches.includes(selectedBatch)) setSelectedBatch("");
            }
        } else {
            setSelectedSubject("");
            setAvailableBatches([]);
            setSelectedBatch("");
        }
    }, [subjectContext, facultySchedule]);`
);

// We should also hide the Target Batch dropdown if subjectContext exists, or at least disable it.
c = c.replace(
    /\{!subjectContext && \(\s*<div className="flex flex-col gap-2 animate-fade-in">\s*<label className="text-\[13px\] font-medium text-gray-500 dark:text-white\/50 uppercase tracking-widest">Target Batch<\/label>/,
    `{!subjectContext && (
        <div className="flex flex-col gap-2 animate-fade-in">
            <label className="text-[13px] font-medium text-gray-500 dark:text-white/50 uppercase tracking-widest">Target Batch</label>`
);

// Wait, the Target Batch dropdown code might look different. Let's find it.
