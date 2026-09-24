import React, { useState, useEffect } from 'react';

import HoldButton from '../../../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { createPortal } from 'react-dom';
import { supabase } from '../../../../../../Shared/lib/supabase/supabaseClient';

export default function SyllabusEditorModal({ subject, onClose, onRefresh, isReadOnly = false }) {
    const [loading, setLoading] = useState(false);
    
    // Syllabus JSON State
    const [syllabus, setSyllabus] = useState({});

    // We'll manage raw fields for common keys
    const [courseTitle, setCourseTitle] = useState('');
    const [objectives, setObjectives] = useState('');
    const [outcomes, setOutcomes] = useState('');
    const [content, setContent] = useState({});
    const [caseLaws, setCaseLaws] = useState('');
    const [readings, setReadings] = useState('');



    const formatRefs = (text) => {
        if (!text) return '';
        // Split by semicolon and join with newline
        return text.split(';').map(s => s.trim()).filter(Boolean).join(';\n');
    };

    const formatCOs = (text) => {
        if (!text) return '';
        // Fix formatting
        return text.replace(/\s*(CO[1-9]+:)/g, '\n$1').trim();
    };

    useEffect(() => {
        if (subject?.syllabus) {
            const s = subject.syllabus;
            setSyllabus(s);
            setCourseTitle(s['Course Title'] || '');
            setObjectives(formatCOs(s['Course Objectives'] || ''));
            setOutcomes(formatCOs(s['Course Learning Outcomes'] || ''));
            setContent(s['Course Content'] || {});
            setCaseLaws(formatRefs(s['Suggested Case Laws'] || s['Suggested Case Laws / Legal Text References'] || s['Suggested Case Studies / Management References'] || s['Suggested Case Studies'] || s['Suggested Environmental Case, Laws'] || s['Suggested Case Studies / Statistical References'] || s['Suggested Case Studies / Advertising References'] || s['Suggested Case Studies / Strategic Management References'] || ''));
            setReadings(formatRefs(s['Suggested Readings'] || ''));
        }
    }, [subject]);

    const handleContentChange = (unitKey, value) => {
        setContent(prev => ({
            ...prev,
            [unitKey]: value
        }));
    };

    const addUnit = () => {
        if (isReadOnly) return;
        const keys = Object.keys(content);
        const nextUnitNumber = keys.length + 1;
        setContent(prev => ({
            ...prev,
            [`UNIT ${nextUnitNumber}`]: ''
        }));
    };

    const removeUnit = (key) => {
        if (isReadOnly) return;
        setContent(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleSave = async () => {
        if (isReadOnly) return;
        setLoading(true);
        try {
            const payloadSyllabus = {
                ...syllabus,
                'Course Title': courseTitle,
                'Course Objectives': objectives,
                'Course Learning Outcomes': outcomes,
                'Course Content': content,
                'Suggested Case Laws': caseLaws,
                'Suggested Readings': readings
            };

            const { error } = await supabase
                .from('master_subjects')
                .update({ syllabus: payloadSyllabus })
                .eq('id', subject.id);

            if (error) throw error;
            window.erpDialog?.alert("✅ Syllabus saved successfully.");
            if(onRefresh) onRefresh();
            if(onClose) onClose();
        } catch (error) {
            console.error("Save error:", error);
            window.erpDialog?.alert("Error saving syllabus.");
        } finally {
            setLoading(false);
        }
    };

    if (!subject) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-themeText dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-book-open text-amber-500"></i>
                            {isReadOnly ? 'Syllabus Viewer' : 'Syllabus Editor'}: {subject.code}
                        </h2>
                        <p className="text-xs font-bold text-themeTextSec dark:text-white/50 mt-1">{subject.name}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-themeText dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">Overview</h3>
                        <div>
                            <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Course Objectives</label>
                            <textarea 
                                readOnly={isReadOnly}
                                rows={6}
                                value={objectives} 
                                onChange={e => setObjectives(e.target.value)} 
                                className="w-full bg-gray-50 dark:bg-black border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText dark:text-white/90 outline-none focus:border-amber-500" 
                                placeholder="E.g., CO1: To introduce..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Learning Outcomes</label>
                            <textarea 
                                readOnly={isReadOnly}
                                rows={6}
                                value={outcomes} 
                                onChange={e => setOutcomes(e.target.value)} 
                                className="w-full bg-gray-50 dark:bg-black border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText dark:text-white/90 outline-none focus:border-amber-500" 
                                placeholder="E.g., CO1: Explain..."
                            />
                        </div>
                    </div>

                    {/* Units */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                            <h3 className="text-sm font-black text-themeText dark:text-white">Course Content (Units)</h3>
                            {!isReadOnly && (
                                <button onClick={addUnit} className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 hover:opacity-80 transition bg-amber-500/10 px-2 py-1 rounded">
                                    + Add Unit
                                </button>
                            )}
                        </div>
                        {Object.keys(content).sort((a, b) => {
                            const roman = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12 };
                            const getVal = (str) => {
                                const m = str.toUpperCase().match(/UNIT\s*([IVX]+)/);
                                return (m && roman[m[1]]) ? roman[m[1]] : 99;
                            };
                            return getVal(a) - getVal(b);
                        }).map((key) => (
                            <div key={key} className="bg-gray-50 dark:bg-black border border-themeBorder dark:border-white/10 rounded-xl p-4 relative group flex flex-col gap-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-bold text-themeText dark:text-white uppercase tracking-wider">{key}</label>
                                    {!isReadOnly && (
                                        <HoldButton size="sm" onHold={() => removeUnit(key)} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>
                null
            </HoldButton>
                                    )}
                                </div>
                                <textarea 
                                    readOnly={isReadOnly}
                                    rows={6}
                                    value={content[key]} 
                                    onChange={e => handleContentChange(key, e.target.value)} 
                                    className="w-full bg-white dark:bg-themeApp border border-themeBorder dark:border-white/10 rounded-lg px-3 py-2 text-sm font-medium text-themeText dark:text-white/90 outline-none focus:border-amber-500" 
                                />
                            </div>
                        ))}
                        {Object.keys(content).length === 0 && (
                            <p className="text-xs text-themeTextSec dark:text-white/50 italic text-center py-4">No units defined.</p>
                        )}
                    </div>

                    {/* Readings and Cases */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-themeText dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">References</h3>
                        <div>
                            <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Suggested Case Laws</label>
                            <textarea 
                                readOnly={isReadOnly}
                                rows={6}
                                value={caseLaws} 
                                onChange={e => setCaseLaws(e.target.value)} 
                                className="w-full bg-gray-50 dark:bg-black border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText dark:text-white/90 outline-none focus:border-amber-500" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Suggested Readings</label>
                            <textarea 
                                readOnly={isReadOnly}
                                rows={6}
                                value={readings} 
                                onChange={e => setReadings(e.target.value)} 
                                className="w-full bg-gray-50 dark:bg-black border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText dark:text-white/90 outline-none focus:border-amber-500" 
                            />
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-white/10 shrink-0 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 dark:bg-white/10 text-themeTextSec dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20 transition">
                        {isReadOnly ? 'Close Viewer' : 'Cancel'}
                    </button>
                    {!isReadOnly && (
                        <button onClick={handleSave} disabled={loading} className="flex-1 py-3 rounded-xl font-black text-sm bg-amber-500 text-black hover:bg-amber-600 transition disabled:opacity-50">
                            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Save Syllabus'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
