import re

with open('src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'r') as f:
    content = f.read()

# Make the batch selector visible even if subjectContext is provided, because a subject can have multiple batches!
# Replace `{!subjectContext && (` before the Target Batch label with `{(!subjectContext || availableBatches.length > 1 || (subjectContext && availableBatches.length > 0)) && (`
# Actually, it's simpler: Just always show the Target Batch selector! The only thing we want to hide is Subject.
# Let's find the exact block for Target Batch.

target_batch_block_old = """                        {!subjectContext && (
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-medium text-themeTextSec">Target Batch</label>
                                <select 
                                    className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
                                    value={selectedBatch}
                                    onChange={(e) => { setSelectedBatch(e.target.value); setSelectedAssessmentType(""); }}
                                >
                                    <option value="">Select Batch</option>
                                    {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                        )}"""

target_batch_block_new = """                        {(
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-medium text-themeTextSec">Target Batch</label>
                                <div className="relative">
                                    <select 
                                        className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
                                        value={selectedBatch}
                                        onChange={(e) => { setSelectedBatch(e.target.value); setSelectedAssessmentType(""); }}
                                    >
                                        <option value="">Select Batch</option>
                                        {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec pointer-events-none text-xs"></i>
                                </div>
                            </div>
                        )}"""

content = content.replace(target_batch_block_old, target_batch_block_new)

# Also add the chevron to the Subject select
subject_block_old = """                                <select 
                                    className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
                                    value={selectedSubject}
                                    onChange={(e) => { setSelectedSubject(e.target.value); setSelectedAssessmentType(""); }}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.master_id || s.id}>{s.code} - {s.name}</option>)}
                                </select>"""

subject_block_new = """                                <div className="relative">
                                    <select 
                                        className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
                                        value={selectedSubject}
                                        onChange={(e) => { setSelectedSubject(e.target.value); setSelectedAssessmentType(""); }}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => <option key={s.id} value={s.master_id || s.id}>{s.code} - {s.name}</option>)}
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec pointer-events-none text-xs"></i>
                                </div>"""

content = content.replace(subject_block_old, subject_block_new)

# And add the chevron to the Assessment Type select
assessment_block_old = """                        <select 
                            className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeAccent outline-none focus:border-themeAccent transition-colors appearance-none"
                            value={selectedAssessmentType}
                            onChange={(e) => setSelectedAssessmentType(e.target.value)}
                        >"""
                        
assessment_block_new = """                        <div className="relative">
                            <select 
                                className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeAccent outline-none focus:border-themeAccent transition-colors appearance-none"
                                value={selectedAssessmentType}
                                onChange={(e) => setSelectedAssessmentType(e.target.value)}
                            >"""
                            
content = content.replace(assessment_block_old, assessment_block_new)
content = content.replace("</optgroup>\n                        </select>\n                    </div>\n                )}", "</optgroup>\n                            </select>\n                            <i className=\"fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec pointer-events-none text-xs\"></i>\n                        </div>\n                    </div>\n                )}")

# We have an extra </div> added, let's fix it safely via regex.
with open('src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'w') as f:
    f.write(content)

