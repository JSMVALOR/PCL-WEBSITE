/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AcademicCalendarGrid() {
    const [columns, setColumns] = useState(['Date', 'Day', 'Event']);
    const [rows, setRows] = useState([
        { id: Date.now().toString(), data: { Date: '', Day: '', Event: '' } }
    ]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'academic_calendar_grid')
                .single();
            
            if (data && data.value) {
                if (data.value.columns) setColumns(data.value.columns);
                if (data.value.rows) setRows(data.value.rows);
            }
        } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
            setIsLoading(false);
        }
    };

    const saveData = async () => {
        setIsSaving(true);
        try {
            const payload = { columns, rows };
            const { error: upsertError } = await supabase
                .from('system_settings')
                .upsert({ key: 'academic_calendar_grid', value: payload }, { onConflict: 'key' });
            if (upsertError) throw upsertError;
            if (window.erpToast) window.erpToast.show("Calendar updated successfully!", "success"); else window.erpDialog?.alert("Calendar updated successfully!");
        } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
            setIsSaving(false);
        }
    };

    const addRow = () => {
        const emptyData = {};
        columns.forEach(c => emptyData[c] = '');
        setRows([...rows, { id: Date.now().toString(), data: emptyData }]);
    };

    const addColumn = async () => {
        const name = await window.erpDialog.prompt("Enter new column name:", "Add Column");
        if (!name || columns.includes(name)) return;
        setColumns([...columns, name]);
        setRows(rows.map(r => ({ ...r, data: { ...r.data, [name]: '' } })));
    };

    const deleteColumn = async (colName) => {
        if (!(await window.erpDialog.confirm(`Delete column "${colName}"?`))) return;
        setColumns(columns.filter(c => c !== colName));
        setRows(rows.map(r => {
            const newData = { ...r.data };
            delete newData[colName];
            return { ...r, data: newData };
        }));
    };

    const deleteRow = (id) => {
        setRows(rows.filter(r => r.id !== id));
    };

    const updateCell = (rowId, colName, value) => {
        setRows(rows.map(r => {
            if (r.id === rowId) {
                return { ...r, data: { ...r.data, [colName]: value } };
            }
            return r;
        }));
    };

    if (isLoading) return <div className="p-8 text-center text-themeTextSec">Loading grid...</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="w-full mb-6">
                <PageHeader 
                    icon="fa-solid fa-table-cells" 
                    title="Calendar Grid" 
                    subtitle="Dynamic Spreadsheet Interface" 
                    rightContent={
                        <div className="flex flex-wrap gap-3">
                            <button onClick={addColumn} className="px-5 py-3 rounded-xl bg-black/5 dark:bg-white/10 text-themeText font-bold text-[13px] hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-2">
                                <i className="fa-solid fa-plus"></i> Add Column
                            </button>
                            <button onClick={addRow} className="px-5 py-3 rounded-xl bg-black/5 dark:bg-white/10 text-themeText font-bold text-[13px] hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-2">
                                <i className="fa-solid fa-plus"></i> Add Row
                            </button>
                            <button onClick={saveData} disabled={isSaving} className="px-6 py-3 rounded-xl bg-themeAccent text-white font-bold text-[13px] hover:bg-themeAccent/90 transition-colors shadow-lg shadow-themeAccent/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <i className="fa-solid fa-floppy-disk"></i> {isSaving ? 'Saving...' : 'Save Grid'}
                            </button>
                        </div>
                    }
                />
            </div>

            <div className="bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-sm rounded-3xl overflow-hidden px-2 py-4">
<div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-black/[0.04] dark:border-white/[0.08]">
                            {columns.map(col => (
                                <th key={col} className="p-4 text-xs font-bold text-themeText uppercase tracking-widest min-w-[150px] group relative">
                                    {col}
                                    <button 
                                        onClick={() => deleteColumn(col)} 
                                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 transition-opacity"
                                        title="Delete Column"
                                    >
                                        <i className="fa-solid fa-trash-can"></i>
                                    </button>
                                </th>
                            ))}
                            <th className="w-16 p-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={row.id} className="border-b border-black/[0.04] dark:border-white/[0.08] last:border-none hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                                {columns.map(col => (
                                    <td key={col} className="p-2">
                                        <input
                                            type="text"
                                            value={row.data[col] || ''}
                                            onChange={(e) => updateCell(row.id, col, e.target.value)}
                                            className="w-full bg-transparent px-3 py-2 text-sm font-medium text-themeText border border-transparent focus:border-themeAccent/30 focus:bg-white/50 dark:focus:bg-black/20 rounded-lg outline-none transition-all"
                                            placeholder="..."
                                        />
                                    </td>
                                ))}
                                <td className="p-2 text-center">
                                    <button 
                                        onClick={() => deleteRow(row.id)}
                                        className="text-themeTextSec hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                                        title="Delete Row"
                                    >
                                        <i className="fa-solid fa-trash-can"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} className="p-8 text-center text-sm text-themeTextSec">
                                    No rows added yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            </div>
        </div>
    );
}
