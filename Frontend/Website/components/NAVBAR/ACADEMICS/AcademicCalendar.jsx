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

    const loadLogoAsBase64 = async () => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = "/favicon.svg"; 
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = 500;
                canvas.height = 500;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, 500, 500);
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = () => resolve(null);
        });
    };

    const generateLuxuryPDF = async () => {
        if (!calendarData || !calendarData.columns || !calendarData.rows) return;
        setIsGenerating(true);

        try {
            const doc = new window.jspdf.jsPDF('p', 'pt', 'a4');
            
            // --- BRAND COLORS (Brown & Gold Theme) ---
            const brandBrown = [93, 64, 55]; // #5D4037
            const brandGold = [212, 175, 55]; // #d4af37
            const dark = [26, 26, 46]; // #1a1a2e
            
            // Center variables
            const pageWidth = doc.internal.pageSize.getWidth();
            const centerX = pageWidth / 2;

            // --- HEADER SECTION ---
            const logoData = await loadLogoAsBase64();
            if (logoData) {
                doc.addImage(logoData, "PNG", centerX - 40, 30, 80, 80);
            }

            doc.setFont("times", "bold");
            doc.setTextColor(...brandBrown);
            doc.setFontSize(24);
            doc.text("PRUDENTIA COLLEGE OF LAW", centerX, 140, { align: 'center' });
            
            // Decorative Line under title
            doc.setDrawColor(...brandBrown);
            doc.setLineWidth(1);
            doc.line(centerX - 150, 150, centerX + 150, 150);
            doc.setDrawColor(...brandGold);
            doc.setLineWidth(0.5);
            doc.line(centerX - 150, 153, centerX + 150, 153);

            doc.setFontSize(14);
            doc.setTextColor(...dark);
            doc.text("ANNUAL ACADEMIC CALENDAR 2026 – 2027", centerX, 180, { align: 'center' });
            
            doc.setFont("times", "italic");
            doc.setFontSize(11);
            doc.text("Academic Schedule as per the Osmania University Communication", centerX, 200, { align: 'center' });
            
            doc.setFont("times", "bold");
            doc.setFontSize(11);
            doc.text("LL. B. (3-YDC); B.A. LL. B. and B.B.A. LL. B (5-YDC)", centerX, 220, { align: 'center' });
            
            doc.text("CIRCULAR – 01/PCL/26", centerX, 240, { align: 'center' });

            // Table Body
            const headers = [calendarData.columns];
            const data = calendarData.rows.map(row => 
                calendarData.columns.map(col => row.data[col] || '')
            );

            doc.autoTable({
                startY: 270,
                head: headers,
                body: data,
                theme: 'grid',
                headStyles: {
                    fillColor: [250, 250, 250], // Whiteish
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    fontSize: 11,
                    cellPadding: 12,
                    halign: 'center',
                    lineColor: [0, 0, 0],
                    lineWidth: 1
                },
                bodyStyles: {
                    textColor: [0, 0, 0],
                    fontSize: 11,
                    cellPadding: 12,
                    lineColor: [0, 0, 0],
                    lineWidth: 1
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 40 },
                    2: { halign: 'center', cellWidth: 120 },
                    3: { halign: 'center', cellWidth: 140 }
                },
                styles: {
                    font: 'times',
                    lineWidth: 1,
                    lineColor: [0, 0, 0]
                },
                margin: { top: 270, left: 50, right: 50 }
            });
            
            const finalY = doc.lastAutoTable.finalY + 40;
            
            doc.setFont("times", "bold");
            doc.setFontSize(10);
            doc.setTextColor(...dark);
            doc.text("Important Note: ", 50, finalY);
            
            doc.setFont("times", "normal");
            doc.text("This calendar has been prepared based on the academic schedule as per the Osmania University", 130, finalY);
            doc.text("communication. Any subsequent changes, additions or revised dates notified by the University shall prevail and will be", 50, finalY + 15);
            doc.text("incorporated by the College accordingly.", 50, finalY + 30);
            
            doc.setFontSize(11);
            doc.text("SIGNATURE AND SEAL OF THE INSTITUTION", pageWidth - 50, finalY + 90, { align: 'right' });

            doc.save('Prudentia_Academic_Calendar.pdf');
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            if(window.erpToast) window.erpToast.show("Failed to generate PDF. Please try again.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] font-sans selection:bg-[var(--accent)] selection:text-white flex flex-col">
            <SEO title="Academic Calendar | Prudentia College of Law" description="View the academic calendar, important dates, exams, and holidays." />
            <Navbar />
            
            <main className="flex-1 pt-[90px] md:pt-[120px] pb-[20px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="flex flex-col">
                            <span className="text-[var(--accent)] font-bold tracking-widest uppercase text-xs sm:text-sm mb-3 block">Schedule</span>
                            <h1 className="text-4xl md:text-5xl lg:text-7xl tracking-tight text-[var(--text-color)] mb-8 leading-tight font-serif font-bold">Academic Calendar</h1>
                            <p className="text-[var(--text-muted)] mt-4 max-w-2xl text-lg">Stay updated with important semester dates, examination schedules, and college holidays.</p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={generateLuxuryPDF} 
                                disabled={isGenerating || !calendarData}
                                className="h-12 px-6 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold transition flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                            >
                                {isGenerating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-download"></i>}
                                <span>Download PDF</span>
                            </button>
                        </div>
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

            
        </div>
    );
}
