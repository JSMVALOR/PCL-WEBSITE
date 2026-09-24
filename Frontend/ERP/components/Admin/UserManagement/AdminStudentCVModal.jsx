/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from 'react';
import useCVData from '../../../hooks/useCVData';
import generatePDF, { Resolution, Margin } from 'react-to-pdf';

const S = {
 row: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
 ul: { margin: "4px 0 0 20px", padding: 0, listStyleType: "disc" },
 li: { marginBottom: "2px" } };

const SectionHeading = ({ text, style }) => (
 <h2 style={{ fontSize: "10pt", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px", pageBreakAfter: "avoid", ...style }}>
 {text}
 </h2>
);

const EntryRow = ({ left, right }) => (
 <div style={{ ...S.row, marginBottom: "2px" }}>
 <span style={{ fontWeight: 700, fontSize: "10.5pt" }}>{left}</span>
 <span style={{ fontSize: "9pt", fontWeight: 600, color: "#64748b", flexShrink: 0, marginLeft: "16px", whiteSpace: "nowrap" }}>{right}</span>
 </div>
);

const SubLine = ({ children, style }) => (
 <p style={{ fontSize: "9.5pt", fontStyle: "italic", color: "#475569", marginBottom: "4px", ...style }}>{children}</p>
);

const Desc = ({ text }) => (
 <p style={{ fontSize: "9.5pt", color: "#334155", lineHeight: 1.6, textAlign: "justify", margin: "4px 0 0" }}>{text}</p>
);

const Bullet = ({ items }) => (
 <ul style={S.ul}>
 {items.map((it, i) => (
 <li key={i} style={{ ...S.li, fontSize: "9.5pt", color: "#334155" }}>
 {it}
 </li>
 ))}
 </ul>
);

const AchSection = ({ title, items, headStyle, mode }) => {
 if (!items || items.length === 0) return null;
 return (
 <div style={{ marginBottom: "18px", pageBreakInside: "avoid" }}>
 <SectionHeading text={title} style={headStyle} />
 {mode === "bullet" ? (
 <ul style={S.ul}>
 {items.map((a, i) => (
 <li key={i} style={{ ...S.li, fontSize: "9.5pt", color: "#334155" }}>
 <strong>{a.title}</strong> — {a.issuer}{a.role ? `, ${a.role}` : ""} ({a.date_achieved})
 </li>
 ))}
 </ul>
 ) : (
 items.map((a, i) => (
 <div key={i} style={{ ...S.row, marginBottom: "5px" }}>
 <span style={{ fontSize: "9.5pt", color: "#334155" }}>
 <strong>{a.title}</strong> — {a.issuer}
 {a.role ? <span style={{ fontStyle: "italic", color: "#64748b" }}> ({a.role})</span> : null}
 </span>
 <span style={{ fontSize: "8.5pt", color: "#94a3b8", flexShrink: 0, marginLeft: "16px" }}>{a.date_achieved}</span>
 </div>
 ))
 )}
 </div>
 );
};

const ModernTemplate = (data, config) => {
 const HS = { color: "#d97706" };
 return (
 <div>
 <div style={{ borderBottom: "3px solid #f59e0b", paddingBottom: "14px", marginBottom: "20px" }}>
 <h1 style={{ fontSize: "26pt", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: "#0f172a", margin: "0 0 6px" }}>
 {data.personal.name}
 </h1>
 <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", fontSize: "8.5pt", fontWeight: 500, color: "#475569" }}>
 <span style={{ fontWeight: 700, color: "#d97706" }}>{data.academic.degree}</span>
 {data.personal.email && <span>· {data.personal.email}</span>}
 {data.personal.phone && data.personal.phone !== "Update in Profile" && <span>· {data.personal.phone}</span>}
 {data.personal.linkedin && data.personal.linkedin !== "Update in Profile" && <span>· {data.personal.linkedin}</span>}
 </div>
 </div>

 <div style={{ marginBottom: "18px" }}>
 <SectionHeading text="Education" style={HS} />
 <EntryRow left={data.academic.university} right={data.academic.duration} />
 <SubLine>{data.academic.degree}</SubLine>
 <Bullet items={[`Cumulative GPA: ${data.academic.cgpa}`]} />
 </div>

 {data.experience.length > 0 && (
 <div style={{ marginBottom: "18px" }}>
 <SectionHeading text="Legal Experience" style={HS} />
 {data.experience.map((exp, i) => (
 <div key={i} style={{ marginBottom: "14px", pageBreakInside: "avoid" }}>
 <EntryRow left={exp.company_name} right={exp.duration} />
 <SubLine>
 {exp.role_title}
 {exp.location ? ` · ${exp.location}` : ""}
 </SubLine>
 {exp.description && <Desc text={exp.description} />}
 </div>
 ))}
 </div>
 )}

 <AchSection title="Moot Court & Competitions" items={data.mootCourt} headStyle={HS} />
 <AchSection title="Awards & Honors" items={data.awards} headStyle={HS} />
 <AchSection title="Publications" items={data.publications} headStyle={HS} mode="bullet" />
 <AchSection title="Certifications" items={data.certifications} headStyle={HS} mode="bullet" />

 <div style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
 <p style={{ fontSize: "6.5pt", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "#cbd5e1", margin: 0 }}>
 Officially Verified & Minted · Prudentia College of Law ERP Engine
 </p>
 <p style={{ fontSize: "6pt", fontWeight: 600, color: "#e2e8f0", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.15em" }}>
 Document ID: {data.docId}
 </p>
 </div>
 </div>
 );
};

export default function AdminStudentCVModal({ studentId, onClose }) {
 const { erpData, isLoading } = useCVData(studentId);
 const [isExporting, setIsExporting] = useState(false);

 const handleExport = async () => {
 if (!erpData) return;
 setIsExporting(true);
 const getTargetElement = () => document.getElementById('admin-cv-pdf-target');
 const filename = `${erpData.personal.name.replace(/\s+/g, '_')}_PCL_CV.pdf`;
 
 try {
 await generatePDF(getTargetElement, {
 filename: filename,
 resolution: Resolution.HIGH,
 page: { margin: Margin.NONE, format: 'a4' },
 canvas: { scale: 2, useCORS: true }
 });
 } catch (error) {
 console.error("PDF Export failed", error);
 } finally {
 setIsExporting(false);
 }
 };

 return (
 <div className="fixed inset-0 z-[200] flex flex-col bg-themeApp animate-fade-in font-sans overflow-hidden">
 <div className="w-full mx-auto flex flex-col h-screen relative z-10 bg-themePanel/85 backdrop-blur-2xl border-x border-themeBorder dark:border-white/5">
 
 {/* Header */}
 <div className="flex justify-between items-center p-6 border-b-theme border-themeBorder dark:border-white/5 bg-themePanel/85 backdrop-blur-2xl">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
 <i className="fa-solid fa-file-pdf"></i>
 </div>
 <div>
 <h2 className="text-lg font-semibold tracking-tight text-themeText tracking-normal tracking-tight">Student Portfolio CV</h2>
 <p className="text-xs font-bold text-themeTextSec">Live ERP Generated Document</p>
 </div>
 </div>
 <div className="flex gap-2">
 <button type="button" 
 onClick={handleExport}
 disabled={isLoading || isExporting}
 className="bg-emerald-500 hover:bg-emerald-400 text-themeText px-5 py-2.5 rounded-lg text-[13px] font-medium transition flex items-center gap-2 disabled:opacity-50"
 >
 {isExporting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-download"></i>} 
 Export PDF
 </button>
 <button type="button" onClick={onClose} className="w-10 h-10 rounded-lg border border-black/5 dark:border-white/10 flex justify-center items-center text-themeTextSec hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-colors">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-themeApp">
 {isLoading ? (
 <div className="flex flex-col items-center justify-center py-20 text-emerald-500/50">
 <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4"></i>
 <p className="text-[15px] font-semibold tracking-normal text-themeTextSec">Fetching Verified Records...</p>
 </div>
 ) : erpData ? (
 <div className="w-full max-w-[794px] bg-themePanel/85 backdrop-blur-2xl rounded-md overflow-hidden shrink-0" style={{ minHeight: '1123px' }}>
 <div id="admin-cv-pdf-target" style={{
 width: "210mm",
 minHeight: "297mm",
 padding: "20mm",
 boxSizing: "border-box",
 background: "#ffffff",
 color: "#000000",
 display: "flex",
 flexDirection: "column",
 overflow: "hidden" }}>
 {ModernTemplate(erpData, {})}
 </div>
 </div>
 ) : (
 <div className="py-20 text-center text-themeTextSec">Failed to load student data.</div>
 )}
 </div>
 </div>
 </div>
 );
}
