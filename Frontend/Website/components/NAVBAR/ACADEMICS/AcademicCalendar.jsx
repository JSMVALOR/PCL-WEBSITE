import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import SEO from '../../../components/SEO/SEO';
import Navbar from '../Navbar';
import PremiumFooter from '../../UI/PremiumFooter/PremiumFooter';

export default function AcademicCalendar() {
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchCalendarData();
    }, []);

    const fetchCalendarData = async () => {
        setLoading(true);
        try {
            // Fetch the grid data from system_settings instead of academic_calendar table
            const { data: gridData, error: gridError } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'academic_calendar_grid')
                .single();
            
            if (!gridError && gridData?.value) {
                setCalendarData(gridData.value);
            }

            // Fetch generic PDF URL fallback
            const { data: settingData, error: settingError } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'academic_calendar_pdf')
                .single();
            
            if (!settingError && settingData?.value?.url) {
                setPdfUrl(settingData.value.url);
            }
        } catch (error) {
            console.error("Failed to load academic calendar:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateLuxuryPDF = () => {
        if (!calendarData || !calendarData.columns || !calendarData.rows) return;
        setIsGenerating(true);

        try {
            const doc = new jsPDF('p', 'pt', 'a4');
            
            // Branding Header
            doc.setFillColor(15, 23, 42); // Dark slate background
            doc.rect(0, 0, doc.internal.pageSize.width, 100, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text("PRUDENTIA COLLEGE OF LAW", 40, 50);
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text("ACADEMIC CALENDAR", 40, 75);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width - 40, 75, { align: 'right' });

            // Table Body
            const headers = [calendarData.columns];
            const data = calendarData.rows.map(row => 
                calendarData.columns.map(col => row.data[col] || '')
            );

            doc.autoTable({
                startY: 120,
                head: headers,
                body: data,
                theme: 'grid',
                headStyles: {
                    fillColor: [194, 166, 115], // Premium Gold
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 10,
                    cellPadding: 8
                },
                bodyStyles: {
                    textColor: [50, 50, 50],
                    fontSize: 9,
                    cellPadding: 8
                },
                alternateRowStyles: {
                    fillColor: [250, 250, 250]
                },
                styles: {
                    font: 'helvetica',
                    lineWidth: 0.1,
                    lineColor: [200, 200, 200]
                },
                margin: { top: 120, left: 40, right: 40 }
            });

            doc.save('Prudentia_Academic_Calendar.pdf');
        } catch (error) {
            console.error("Failed to generate PDF:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] font-sans selection:bg-[var(--accent)] selection:text-white flex flex-col">
            <SEO title="Academic Calendar | Prudentia College of Law" description="View the academic calendar, important dates, exams, and holidays." />
            <Navbar />
            
            <main className="flex-1 pt-[160px] pb-[100px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="flex flex-col">
                            <span className="text-[var(--accent)] font-bold tracking-widest uppercase text-xs sm:text-sm mb-3 block">Schedule</span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] tracking-tight font-serif font-bold">Academic Calendar</h1>
                            <p className="text-[var(--text-muted)] mt-4 max-w-2xl text-lg">Stay updated with important semester dates, examination schedules, and college holidays.</p>
                        </div>
                        
                        <div className="flex gap-3"></div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-32">
                            <i className="fa-solid fa-circle-notch fa-spin text-[var(--accent)] text-4xl"></i>
                        </div>
                    ) : !calendarData || !calendarData.columns || calendarData.columns.length === 0 ? (
                        <div className="text-center py-32 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl">
                            <i className="fa-regular fa-calendar-xmark text-5xl text-[var(--text-muted)] mb-4"></i>
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">No Schedule Available</h3>
                            <p className="text-[var(--text-muted)] mt-2">The academic calendar is currently being updated for the upcoming session.</p>
                        </div>
                    ) : (
                        <div className="w-full bg-white dark:bg-white/5 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-[var(--accent)] text-white">
                                            {calendarData.columns.map(col => (
                                                <th key={col} className="px-6 py-5 text-sm font-bold uppercase tracking-widest border-b border-black/10">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/10">
                                        {calendarData.rows.length === 0 ? (
                                            <tr>
                                                <td colSpan={calendarData.columns.length} className="px-6 py-12 text-center text-[var(--text-muted)]">
                                                    No schedule data available.
                                                </td>
                                            </tr>
                                        ) : (
                                            calendarData.rows.map((row, idx) => (
                                                <tr key={row.id} className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                                    {calendarData.columns.map((col, cIdx) => (
                                                        <td key={col} className={`px-6 py-5 text-[var(--text-primary)] ${cIdx === 0 ? 'font-bold' : ''}`}>
                                                            {row.data[col] || '-'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <PremiumFooter />
        </div>
    );
}
