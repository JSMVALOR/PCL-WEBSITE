/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import generatePDF, { Resolution, Margin } from 'react-to-pdf';

// ═══════════════════════════════════════════════════════════════
// ZERO-LAG CACHING (Session Storage)
// ═══════════════════════════════════════════════════════════════
const CACHE_KEY = "erp_cv_builder_data";

const readCache = () => {
 try {
 const cached = sessionStorage.getItem(CACHE_KEY);
 if (cached) return JSON.parse(cached);
 } catch (e) {
 console.warn("Session cache read error:", e);
 }
 return {
 personal: {},
 academic: {},
 experience: [],
 mootCourt: [],
 awards: [],
 publications: [],
 certifications: [],
 extracurriculars: [],
 docId: "",
 };
};

const writeCache = (data) => {
 try {
 sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
 } catch (e) {
 console.warn("Session cache write error:", e);
 }
};

// ═══════════════════════════════════════════════════════════════
// INLINE-STYLED TEMPLATES FOR PRINT FIDELITY
// ═══════════════════════════════════════════════════════════════

// Reusable micro-components for templates
const S = {
 row: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
 ul: { margin: "4px 0 0 20px", padding: 0, listStyleType: "disc" },
 li: { marginBottom: "2px" },
};

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

// --- Template 1: Modern ---
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
 <Bullet
 items={[
 ...(config.includeCGPA ? [`Cumulative GPA: ${data.academic.cgpa}`] : []),
 ...(config.includeClassRank ? [`University Batch Rank: ${data.academic.rank}`] : []),
 ]}
 />
 </div>

 {config.includeExperience && data.experience.length > 0 && (
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

 {config.includeMootCourt && <AchSection title="Moot Court & Competitions" items={data.mootCourt} headStyle={HS} />}
 {config.includeAwards && <AchSection title="Awards & Honors" items={data.awards} headStyle={HS} />}
 {config.includePublications && <AchSection title="Publications" items={data.publications} headStyle={HS} mode="bullet" />}
 {config.includeCertifications && <AchSection title="Certificates" items={data.certifications} headStyle={HS} mode="bullet" />}
 {config.includeExtracurriculars && <AchSection title="Extracurricular Activities" items={data.extracurriculars} headStyle={HS} />}

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

// --- Template 2: Classic ---
const ClassicTemplate = (data, config) => {
 const HS = { borderBottom: "1px solid #cbd5e1", paddingBottom: "3px", color: "#0f172a" };
 return (
 <div>
 <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: "12px", marginBottom: "18px" }}>
 <h1 style={{ fontSize: "22pt", fontWeight: 700, letterSpacing: "0.02em", margin: "0 0 6px", textTransform: "uppercase" }}>{data.personal.name}</h1>
 <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px 10px", fontSize: "8.5pt", color: "#475569" }}>
 <span style={{ fontWeight: 600, color: "#0f172a" }}>{data.academic.degree}</span>
 {data.personal.email && (
 <>
 <span style={{ color: "#cbd5e1" }}>|</span> <span>{data.personal.email}</span>
 </>
 )}
 {data.personal.phone && data.personal.phone !== "Update in Profile" && (
 <>
 <span style={{ color: "#cbd5e1" }}>|</span> <span>{data.personal.phone}</span>
 </>
 )}
 {data.personal.linkedin && data.personal.linkedin !== "Update in Profile" && (
 <>
 <span style={{ color: "#cbd5e1" }}>|</span> <span>{data.personal.linkedin}</span>
 </>
 )}
 </div>
 </div>

 <div style={{ marginBottom: "16px" }}>
 <SectionHeading text="Education" style={HS} />
 <EntryRow left={data.academic.university} right={data.academic.duration} />
 <SubLine>{data.academic.degree}</SubLine>
 <Bullet
 items={[
 ...(config.includeCGPA ? [`Cumulative Grade Point Average: ${data.academic.cgpa}`] : []),
 ...(config.includeClassRank ? [`University Batch Rank: ${data.academic.rank}`] : []),
 ]}
 />
 </div>

 {config.includeExperience && data.experience.length > 0 && (
 <div style={{ marginBottom: "16px" }}>
 <SectionHeading text="Legal Experience" style={HS} />
 {data.experience.map((exp, i) => (
 <div key={i} style={{ marginBottom: "14px", pageBreakInside: "avoid" }}>
 <EntryRow left={`${exp.company_name}${exp.location ? ", " + exp.location : ""}`} right={exp.duration} />
 <SubLine>{exp.role_title}</SubLine>
 {exp.description && <Desc text={exp.description} />}
 </div>
 ))}
 </div>
 )}

 {config.includeMootCourt && <AchSection title="Moot Court & Competitions" items={data.mootCourt} headStyle={HS} />}
 {config.includeAwards && <AchSection title="Honors & Awards" items={data.awards} headStyle={HS} />}
 {config.includePublications && <AchSection title="Publications" items={data.publications} headStyle={HS} mode="bullet" />}
 {config.includeCertifications && <AchSection title="Certificates" items={data.certifications} headStyle={HS} mode="bullet" />}
 {config.includeExtracurriculars && <AchSection title="Activities & Leadership" items={data.extracurriculars} headStyle={HS} />}

 <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
 <p style={{ fontSize: "6.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#cbd5e1", margin: 0 }}>
 Verified Record · Prudentia College of Law
 </p>
 <p style={{ fontSize: "6pt", color: "#e2e8f0", marginTop: "2px" }}>{data.docId}</p>
 </div>
 </div>
 );
};

// --- Template 3: Executive Split ---
const SidebarLabel = ({ text }) => (
 <p style={{ fontSize: "7pt", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: "#94a3b8", marginBottom: "6px", marginTop: "16px" }}>
 {text}
 </p>
);

const SidebarItem = ({ icon, text }) => (
 <p style={{ fontSize: "8pt", color: "#cbd5e1", margin: "0 0 5px", display: "flex", alignItems: "flex-start", gap: "6px", lineHeight: 1.4, wordBreak: "break-word" }}>
 <span style={{ color: "#64748b", fontSize: "7pt", marginTop: "1px", flexShrink: 0 }}>{icon}</span>
 <span>{text}</span>
 </p>
);

const ExecutiveSplitTemplate = (data, config) => {
 const initials = (data.personal.name || "U")
 .split(" ")
 .map((w) => w[0])
 .join("")
 .slice(0, 2)
 .toUpperCase();
 const mainHS = {
 fontSize: "9.5pt",
 fontWeight: 800,
 textTransform: "uppercase",
 letterSpacing: "0.14em",
 color: "#1e3a5f",
 borderBottom: "1.5px solid #1e3a5f",
 paddingBottom: "4px",
 marginBottom: "10px",
 pageBreakAfter: "avoid",
 };

 return (
 <div>
 <div style={{ width: "72mm", minHeight: "297mm", background: "#0f172a", color: "#e2e8f0", padding: "20mm 14mm", boxSizing: "border-box", flexShrink: 0, display: "flex", flexDirection: "column" }}>
 <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", border: "3px solid #1e293b", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
 {data.personal.photo_url ? (
 <img src={data.personal.photo_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
 ) : (
 <span style={{ fontSize: "22pt", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>{initials}</span>
 )}
 </div>

 <h1 style={{ fontSize: "14pt", fontWeight: 800, textAlign: "center", margin: "0 0 4px", color: "#ffffff", lineHeight: 1.2 }}>{data.personal.name}</h1>
 <p style={{ fontSize: "7.5pt", textAlign: "center", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 0" }}>
 {data.academic.degree}
 </p>

 <SidebarLabel text="Contact" />
 <div style={{ borderTop: "1px solid #1e293b", paddingTop: "8px" }}>
 {data.personal.email && <SidebarItem icon="✉" text={data.personal.email} />}
 {data.personal.phone && data.personal.phone !== "Update in Profile" && <SidebarItem icon="☏" text={data.personal.phone} />}
 {data.personal.linkedin && data.personal.linkedin !== "Update in Profile" && <SidebarItem icon="⟡" text={data.personal.linkedin} />}
 </div>

 <SidebarLabel text="Education" />
 <div style={{ borderTop: "1px solid #1e293b", paddingTop: "8px" }}>
 <p style={{ fontSize: "8.5pt", fontWeight: 700, color: "#ffffff", margin: "0 0 2px", lineHeight: 1.3 }}>{data.academic.university}</p>
 <p style={{ fontSize: "7.5pt", color: "#94a3b8", margin: "0 0 4px" }}>{data.academic.duration}</p>
 {config.includeCGPA && (
 <p style={{ fontSize: "8pt", color: "#cbd5e1", margin: "2px 0" }}>
 CGPA: <strong style={{ color: "#f59e0b" }}>{data.academic.cgpa}</strong>
 </p>
 )}
 {config.includeClassRank && (
 <p style={{ fontSize: "8pt", color: "#cbd5e1", margin: "2px 0" }}>
 Rank: <strong style={{ color: "#f59e0b" }}>{data.academic.rank}</strong>
 </p>
 )}
 </div>

 {config.includeCertifications && data.certifications.length > 0 && (
 <>
 <SidebarLabel text="Certificates" />
 <div style={{ borderTop: "1px solid #1e293b", paddingTop: "8px" }}>
 {data.certifications.map((c, i) => (
 <p key={i} style={{ fontSize: "7.5pt", color: "#cbd5e1", margin: "0 0 5px", lineHeight: 1.35 }}>
 <strong style={{ color: "#ffffff" }}>{c.title}</strong>
 <br />
 <span style={{ color: "#64748b" }}>
 {c.issuer}, {c.date_achieved}
 </span>
 </p>
 ))}
 </div>
 </>
 )}

 {config.includeExtracurriculars && data.extracurriculars.length > 0 && (
 <>
 <SidebarLabel text="Activities" />
 <div style={{ borderTop: "1px solid #1e293b", paddingTop: "8px" }}>
 {data.extracurriculars.map((e, i) => (
 <p key={i} style={{ fontSize: "7.5pt", color: "#cbd5e1", margin: "0 0 4px", lineHeight: 1.35 }}>
 <strong style={{ color: "#ffffff" }}>{e.title}</strong> — {e.role}
 </p>
 ))}
 </div>
 </>
 )}

 <div style={{ marginTop: "auto", paddingTop: "16px" }}>
 <div style={{ width: "20px", height: "1px", background: "#334155", marginBottom: "6px" }}></div>
 <p style={{ fontSize: "5.5pt", color: "#334155", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>{data.docId}</p>
 </div>
 </div>

 <div style={{ flex: 1, padding: "20mm 20mm 20mm 16mm", color: "#1e293b", fontSize: "9.5pt", lineHeight: 1.55, display: "flex", flexDirection: "column" }}>
 {config.includeExperience && data.experience.length > 0 && (
 <div style={{ marginBottom: "18px" }}>
 <h2 style={mainHS}>Professional Experience</h2>
 {data.experience.map((exp, i) => (
 <div key={i} style={{ marginBottom: "14px", pageBreakInside: "avoid" }}>
 <div style={S.row}>
 <span style={{ fontWeight: 700, fontSize: "10pt" }}>{exp.company_name}</span>
 <span style={{ fontSize: "8.5pt", fontWeight: 600, color: "#64748b", flexShrink: 0, marginLeft: "12px", whiteSpace: "nowrap" }}>
 {exp.duration}
 </span>
 </div>
 <p style={{ fontSize: "9pt", fontStyle: "italic", color: "#475569", margin: "1px 0 4px" }}>
 {exp.role_title}
 {exp.location ? ` · ${exp.location}` : ""}
 </p>
 {exp.description && <p style={{ fontSize: "9pt", color: "#334155", lineHeight: 1.6, textAlign: "justify" }}>{exp.description}</p>}
 </div>
 ))}
 </div>
 )}

 {config.includeMootCourt && data.mootCourt.length > 0 && (
 <div style={{ marginBottom: "18px", pageBreakInside: "avoid" }}>
 <h2 style={mainHS}>Moot Court & Competitions</h2>
 {data.mootCourt.map((m, i) => (
 <div key={i} style={{ ...S.row, marginBottom: "5px" }}>
 <span style={{ fontSize: "9.5pt" }}>
 <strong>{m.title}</strong> — {m.issuer} <span style={{ fontStyle: "italic", color: "#64748b" }}>({m.role})</span>
 </span>
 <span style={{ fontSize: "8.5pt", color: "#94a3b8", flexShrink: 0, marginLeft: "12px" }}>{m.date_achieved}</span>
 </div>
 ))}
 </div>
 )}

 {config.includeAwards && data.awards.length > 0 && (
 <div style={{ marginBottom: "18px", pageBreakInside: "avoid" }}>
 <h2 style={mainHS}>Awards & Honors</h2>
 {data.awards.map((a, i) => (
 <div key={i} style={{ ...S.row, marginBottom: "5px" }}>
 <span style={{ fontSize: "9.5pt" }}>
 <strong>{a.title}</strong> — {a.issuer} <span style={{ fontStyle: "italic", color: "#64748b" }}>({a.role})</span>
 </span>
 <span style={{ fontSize: "8.5pt", color: "#94a3b8", flexShrink: 0, marginLeft: "12px" }}>{a.date_achieved}</span>
 </div>
 ))}
 </div>
 )}

 {config.includePublications && data.publications.length > 0 && (
 <div style={{ marginBottom: "18px", pageBreakInside: "avoid" }}>
 <h2 style={mainHS}>Publications</h2>
 <ul style={S.ul}>
 {data.publications.map((p, i) => (
 <li key={i} style={{ ...S.li, fontSize: "9.5pt", color: "#334155" }}>
 <strong>{p.title}</strong> — {p.issuer} ({p.date_achieved}). <span style={{ fontStyle: "italic", color: "#64748b" }}>{p.role}</span>
 </li>
 ))}
 </ul>
 </div>
 )}

 <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
 <p style={{ fontSize: "6pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#cbd5e1", margin: 0 }}>
 Prudentia College of Law — Official Verified Document
 </p>
 </div>
 </div>
 </div>
 );
};

// --- Template 4: Professional Two-Column ---
const ProfessionalTemplate = (data, config) => {
 const HS = {
 fontSize: "9pt",
 fontWeight: 800,
 textTransform: "uppercase",
 letterSpacing: "0.18em",
 color: "#1e3a5f",
 borderBottom: "2px solid #1e3a5f",
 paddingBottom: "4px",
 marginBottom: "10px",
 };
 return (
 <div>
 <div style={{ background: "#1e3a5f", color: "#ffffff", margin: "-20mm -20mm 0", padding: "18mm 20mm 14mm", marginBottom: "18px" }}>
 <h1 style={{ fontSize: "24pt", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", margin: "0 0 6px" }}>{data.personal.name}</h1>
 <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: "8pt", color: "#93c5fd", fontWeight: 500 }}>
 <span style={{ color: "#ffffff", fontWeight: 700 }}>{data.academic.degree}</span>
 {data.personal.email && <span>| {data.personal.email}</span>}
 {data.personal.phone && data.personal.phone !== "Update in Profile" && <span>| {data.personal.phone}</span>}
 {data.personal.linkedin && data.personal.linkedin !== "Update in Profile" && <span>| {data.personal.linkedin}</span>}
 </div>
 </div>

 <div style={{ marginBottom: "16px" }}>
 <SectionHeading text="Education" style={HS} />
 <EntryRow left={data.academic.university} right={data.academic.duration} />
 <SubLine>{data.academic.degree}</SubLine>
 <Bullet
 items={[
 ...(config.includeCGPA ? [`CGPA: ${data.academic.cgpa}`] : []),
 ...(config.includeClassRank ? [`Batch Rank: ${data.academic.rank}`] : []),
 ]}
 />
 </div>

 {config.includeExperience && data.experience.length > 0 && (
 <div style={{ marginBottom: "16px" }}>
 <SectionHeading text="Professional Experience" style={HS} />
 {data.experience.map((exp, i) => (
 <div key={i} style={{ marginBottom: "14px", pageBreakInside: "avoid" }}>
 <EntryRow left={exp.company_name} right={exp.duration} />
 <SubLine>
 {exp.role_title}
 {exp.location ? ` — ${exp.location}` : ""}
 </SubLine>
 {exp.description && <Desc text={exp.description} />}
 </div>
 ))}
 </div>
 )}

 {config.includeMootCourt && <AchSection title="Moot Court Achievements" items={data.mootCourt} headStyle={HS} />}
 {config.includeAwards && <AchSection title="Awards & Distinctions" items={data.awards} headStyle={HS} />}
 {config.includePublications && <AchSection title="Academic Publications" items={data.publications} headStyle={HS} mode="bullet" />}
 {config.includeCertifications && <AchSection title="Professional Certifications" items={data.certifications} headStyle={HS} mode="bullet" />}
 {config.includeExtracurriculars && <AchSection title="Leadership & Activities" items={data.extracurriculars} headStyle={HS} />}

 <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "2px solid #1e3a5f", textAlign: "center" }}>
 <p style={{ fontSize: "6.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#94a3b8", margin: 0 }}>
 Prudentia College of Law — Official Verified Document
 </p>
 <p style={{ fontSize: "6pt", color: "#cbd5e1", marginTop: "2px" }}>{data.docId}</p>
 </div>
 </div>
 );
};

// ═══════════════════════════════════════════════════════════════
// REGISTRY
// ═══════════════════════════════════════════════════════════════
const TEMPLATES = {
 modern: { name: "Modern (PCL)", icon: "fa-pen-nib", accent: "amber", description: "Contemporary sans-serif with amber accent headings. Best for corporate firms.", render: ModernTemplate },
 classic: { name: "Harvard Classic", icon: "fa-landmark", accent: "slate", description: "Traditional serif layout with rule lines. Favored by top-tier law firms.", render: ClassicTemplate },
 executive: { name: "Executive Split", icon: "fa-columns", accent: "navy", description: "Two-column layout with dark sidebar, profile photo & contact. Premium look.", render: ExecutiveSplitTemplate },
 professional: { name: "Professional Navy", icon: "fa-user-tie", accent: "blue", description: "Navy header block with serif body. Ideal for judicial clerkship applications.", render: ProfessionalTemplate },
};

// ═══════════════════════════════════════════════════════════════
// MAIN BUILDER COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function CVBuilder() {
 const { userSession } = useERP();
 const [isExporting, setIsExporting] = useState(false);
 const [previewScale, setPreviewScale] = useState(1);

 const [cvConfig, setCvConfig] = useState({
 includeCGPA: true,
 includeClassRank: false,
 includeExperience: true,
 includeMootCourt: true,
 includeAwards: true,
 includePublications: true,
 includeCertifications: true,
 includeExtracurriculars: false,
 template: "modern",
 });

 const [erpData, setErpData] = useState(() => readCache());

 // --- PARALLEL DATA FETCHING ---
 const fetchCVData = useCallback(async () => {
 const studentId = userSession?.db_id || userSession?.id;
 if (!studentId) return;

 try {
 const [profileRes, analyticsRes, expRes, achRes] = await Promise.all([
 supabase.from("profiles").select("full_name, phone, department, linkedin_url").eq("id", studentId).single(),
 supabase.from("student_semester_analytics").select("cgpa, batch_rank, batch_total").eq("student_id", studentId).order("declared_on", { ascending: false }).limit(1).single(),
 supabase.from("student_experiences").select("*").eq("student_id", studentId).order("created_at", { ascending: false }),
 supabase.from("student_achievements").select("*").eq("student_id", studentId).eq("is_verified", true).order("date_achieved", { ascending: false }),
 ]);

 const profile = profileRes.data || {};
 const analytics = analyticsRes.data || {};
 const experiences = expRes.data || [];
 const allAch = achRes.data || [];

 const idMatch = userSession?.id?.match(/^(\d{2})/);
 const admYear = idMatch ? 2000 + parseInt(idMatch[1], 10) : new Date().getFullYear() - 3;
 const isLLM = userSession?.academic_batch?.toUpperCase().includes("LLM");
 const gradYear = admYear + (isLLM ? 1 : 5);

 const newData = {
 personal: {
 name: profile.full_name || userSession?.name || "Student",
 email: userSession?.email || "",
 phone: profile.phone || "Update in Profile",
 linkedin: profile.linkedin_url || "Update in Profile",
 },
 academic: {
 degree: profile.department || (isLLM ? "LL.M. (Master of Laws)" : "B.B.A. LL.B. (Hons.)"),
 university: "Prudentia College of Law, School of Law",
 duration: `${admYear} – ${gradYear}`,
 cgpa: analytics.cgpa ? `${analytics.cgpa.toFixed(2)} / 10.0` : "Awaiting Data",
 rank: analytics.batch_rank ? `${analytics.batch_rank} / ${analytics.batch_total}` : "N/A",
 },
 experience: experiences,
 mootCourt: allAch.filter((a) => a.category === "Moot Courts"),
 awards: allAch.filter((a) => a.category === "Awards"),
 publications: allAch.filter((a) => a.category === "Publications"),
 certifications: allAch.filter((a) => a.category === "Certificates"),
 extracurriculars: allAch.filter((a) => a.category === "Leadership"),
 docId: `${userSession.id}-${new Date().getFullYear()}`,
 };

 setErpData(newData);
 writeCache(newData);
 } catch (err) {
 console.error("CV data fetch failed:", err);
 }
 }, [userSession]);

 useEffect(() => {
 fetchCVData();
 }, [fetchCVData]);

 // --- RESPONSIVE PREVIEW SCALING ---
 useEffect(() => {
 const handleResize = () => {
 const container = document.getElementById("cv-preview-container");
 if (!container) return;
 const containerWidth = container.offsetWidth;
 // 794 is the baseline width for A4 at 96 DPI
 const paddingOffset = 32; // 16px padding on each side
 const targetWidth = containerWidth - paddingOffset;
 let scale = targetWidth / 794;
 
 // Apply scale limits
 if (scale > 1) scale = 1;
 if (scale < 0.2) scale = 0.2;
 
 setPreviewScale(scale);
 };
 
 handleResize();
 window.addEventListener("resize", handleResize);
 // Add a slight delay observation as well to catch layout shifts
 const timeoutId = setTimeout(handleResize, 100);
 return () => {
 window.removeEventListener("resize", handleResize);
 clearTimeout(timeoutId);
 };
 }, []);

 const handleToggle = (key) => setCvConfig((prev) => ({ ...prev, [key]: !prev[key] }));

 const handleExport = async () => {
 setIsExporting(true);
 const getTargetElement = () => document.getElementById('cv-pdf-target');
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
 const activeTemplate = TEMPLATES[cvConfig.template] || TEMPLATES.modern;

 const dataToggles = [
 { id: "includeCGPA", label: `Include CGPA (${erpData.academic.cgpa || "—"})`, icon: "fa-graduation-cap" },
 { id: "includeClassRank", label: "Include Batch Rank", icon: "fa-ranking-star" },
 { id: "includeExperience", label: `Legal Experience (${erpData.experience.length})`, icon: "fa-briefcase" },
 { id: "includeMootCourt", label: `Moot Courts (${erpData.mootCourt.length})`, icon: "fa-scale-balanced" },
 { id: "includeAwards", label: `Awards (${erpData.awards.length})`, icon: "fa-medal" },
 { id: "includePublications", label: `Publications (${erpData.publications.length})`, icon: "fa-book-open" },
 { id: "includeCertifications", label: `Certifications (${erpData.certifications.length})`, icon: "fa-certificate" },
 { id: "includeExtracurriculars", label: `Extracurriculars (${erpData.extracurriculars.length})`, icon: "fa-users" },
 ];

 const A4_W = 794;
 const A4_H = 1123;

 return (
 <>
 <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated" id="cv-builder-shell">
 <PageHeader 
 icon="fa-solid fa-file-invoice" 
 title="CV Builder" 
 subtitle="Auto-generate your professional legal resume." 
 rightContent={
 <button
 onClick={handleExport}
 disabled={isExporting}
 className="w-full lg:w-auto px-6 lg:px-8 py-3.5 lg:py-4 bg-themePanel border-theme border-themeBorderStrong hover:bg-neutral-200 text-[#050505] rounded-[2rem] text-[10px] lg:text-xs font-black uppercase tracking-widest transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 shrink-0"
 >
 {isExporting ? <i className="fa-solid fa-circle-notch fa-spin text-lg"></i> : <i className="fa-solid fa-file-pdf text-lg"></i>}
 {isExporting ? "Generating Document..." : "Export PDF"}
 </button>
 }
 />

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
 {/* ═══════════════ LEFT: CONTROLS ═══════════════ */}
 <div className="lg:col-span-4 flex flex-col gap-5 lg:gap-6">
 {/* Template Selector */}
 <div className={`${theme.layout.panel} rounded-[2rem] p-5 lg:p-6 border border-black/10 dark:border-white/20`}>
 <h2 className="text-[10px] lg:text-xs font-black text-themeText uppercase tracking-widest mb-4 flex items-center gap-2">
 <i className="fa-solid fa-wand-magic-sparkles text-themeAccent"></i> Template Selection
 </h2>
 <div className="flex flex-col gap-3">
 {Object.entries(TEMPLATES).map(([key, tmpl]) => (
 <button
 key={key}
 onClick={() => setCvConfig({ ...cvConfig, template: key })}
 className={`w-full text-left p-4 rounded-[2rem] border-theme transition duration-200 group ${
 cvConfig.template === key
 ? "bg-themePanel border-theme border-themeBorderStrong border-black/5 dark:border-white/10 ring-1 ring-themeBorderStrong"
 : "bg-themePanel border-theme border-themeBorderStrong border-black/10 dark:border-white/20 hover:border-black/5 dark:border-white/10 hover:bg-themeElevated/50"
 }`}
 >
 <div className="flex items-center justify-between mb-1.5">
 <span className="flex items-center gap-2.5">
 <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${cvConfig.template === key ? "bg-themeAccent/10 text-themeAccent" : "bg-themePanel border-theme border-themeBorderStrong text-themeTextSec group-hover:text-themeText"}`}>
 <i className={`fa-solid ${tmpl.icon} text-[10px]`}></i>
 </div>
 <span className={`text-xs font-bold tracking-wide ${cvConfig.template === key ? "text-themeAccent" : "text-themeText"}`}>{tmpl.name}</span>
 </span>
 {cvConfig.template === key && <i className="fa-solid fa-circle-check text-themeAccent text-sm"></i>}
 </div>
 <p className={`text-[10px] font-medium ${theme.text.muted} ml-8 leading-relaxed`}>{tmpl.description}</p>
 </button>
 ))}
 </div>
 </div>

 {/* Data Integration Toggles */}
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] p-5 lg:p-6 border border-black/10 dark:border-white/20 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-themePanel/30 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none blur-2xl"></div>
 <div className="flex items-center gap-2 mb-1.5 relative z-10">
 <i className="fa-solid fa-database text-themeAccent"></i>
 <h2 className="text-xs font-black tracking-tight text-themeText uppercase tracking-widest">Data Integration</h2>
 </div>
 <p className={`text-[10px] ${theme.text.secondary} font-medium mb-5 relative z-10`}>Toggle verified ERP records for this resume.</p>
 <div className="flex flex-col gap-2.5 relative z-10">
 {dataToggles.map((toggle) => (
 <label
 key={toggle.id}
 className="flex items-center justify-between p-3.5 bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] cursor-pointer hover:border-black/5 dark:border-white/10 hover:bg-themePanel border-theme border-themeBorderStrong transition group"
 >
 <span className="text-[10px] lg:text-[11px] font-bold text-themeTextSec group-hover:text-themeText transition-colors flex items-center gap-2.5">
 <i className={`fa-solid ${toggle.icon} text-[10px] opacity-50 w-3 text-center`}></i>
 {toggle.label}
 </span>
 <div className="relative flex items-center shrink-0">
 <input
 type="checkbox"
 checked={cvConfig[toggle.id]}
 onChange={() => handleToggle(toggle.id)}
 className="peer appearance-none w-10 h-5 bg-themePanel border-theme border-themeBorderStrong rounded-full checked:bg-amber-500 checked:border-amber-500 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-amber-500/30 focus:ring-offset-1 focus:ring-offset-themePanel"
 />
 <div className="absolute left-[3px] top-[2.5px] w-3.5 h-3.5 bg-neutral-400 peer-checked:bg-[#050505] rounded-full peer-checked:translate-x-5 transition-transform duration-300 ease-out pointer-events-none"></div>
 </div>
 </label>
 ))}
 </div>

 {erpData.experience.length === 0 && (
 <div className="mt-5 p-3.5 bg-blue-500/10 border-theme border-blue-500/20 rounded-[2rem] flex items-start gap-2.5 relative z-10">
 <i className="fa-solid fa-circle-info text-blue-400 mt-0.5 text-xs"></i>
 <p className="text-[10px] font-medium text-blue-200/90 leading-relaxed">Your experience ledger is currently empty. Log internships and work experiences first to populate this section.</p>
 </div>
 )}
 </div>
 </div>

 {/* ═══════════════ RIGHT: A4 LIVE PREVIEW ═══════════════ */}
 <div className="lg:col-span-8 flex flex-col items-center gap-4">
 <div className="flex items-center justify-between w-full px-2">
 <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text.secondary} flex items-center gap-2`}>
 <i className="fa-solid fa-eye text-themeAccent"></i> Live Preview — {activeTemplate.name}
 </span>
 <span className={`text-[9px] font-bold ${theme.text.muted} uppercase tracking-widest px-2 py-1 bg-themePanel border-theme border-themeBorderStrong rounded border border-black/10 dark:border-white/20`}>
 A4 · 210 × 297 mm
 </span>
 </div>

 {/* Interactive Scale Container */}
 <div id="cv-preview-container" className="w-full bg-[#121212] rounded-[2rem] p-4 lg:p-8 flex justify-center items-start overflow-hidden min-h-[500px] relative">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-50 pointer-events-none"></div>
 
 {/* The paper document */}
 <div
 style={{
 width: A4_W * previewScale,
 height: A4_H * previewScale,
 overflow: "hidden",
 borderRadius: "4px",
 boxShadow: "0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
 flexShrink: 0,
 position: "relative",
 zIndex: 10,
 transition: "width 0.2s ease-out, height 0.2s ease-out",
 }}
 >
 <div
 style={{
 width: A4_W,
 height: A4_H,
 transform: `scale(${previewScale})`,
 transformOrigin: "top left",
 background: "#ffffff",
 padding: "75.6px", /* 20mm at 96dpi */
 boxSizing: "border-box",
 display: "flex",
 flexDirection: "column",
 overflow: "hidden",
 }}
 >
 {activeTemplate.render(erpData, cvConfig)}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* ═══ OFF-SCREEN PDF TARGET — specifically for react-to-pdf ═══ */}
 <div style={{ position: "fixed", left: "-9999px", top: "-9999px", zIndex: -9999 }}>
 <div id="cv-pdf-target" style={{
 width: "210mm",
 minHeight: "297mm",
 padding: cvConfig.template === "executive" ? "0" : "20mm",
 boxSizing: "border-box",
 background: "#ffffff",
 color: "#000000",
 display: "flex",
 flexDirection: "column",
 overflow: "hidden",
 }}>
 {activeTemplate.render(erpData, cvConfig)}
 </div>
 </div>

 {/* ═══ HIDDEN PRINT SHEET — full-size, only visible to @media print ═══ */}
 {createPortal(
 <div id="cv-print-target" style={{ display: "none" }}>
 <div
 style={{
 width: "210mm",
 minHeight: "297mm",
 padding: cvConfig.template === "executive" ? "0" : "20mm",
 boxSizing: "border-box",
 background: "#ffffff",
 color: "#000000",
 display: "flex",
 flexDirection: "column",
 overflow: "hidden",
 }}
 >
 {activeTemplate.render(erpData, cvConfig)}
 </div>
 </div>,
 document.body
 )}

 {/* ═══ PRINT CSS ═══ */}
 <style>{`
 @media print {
 @page {
 size: A4 portrait;
 margin: 0;
 }
 html, body {
 margin: 0 !important;
 padding: 0 !important;
 width: 210mm !important;
 height: 297mm !important;
 overflow: hidden !important;
 -webkit-print-color-adjust: exact !important;
 print-color-adjust: exact !important;
 background: white !important;
 }
 /* Hide everything */
 body > * {
 display: none !important;
 visibility: hidden !important;
 }
 /* Show only print target */
 body > #cv-print-target {
 display: block !important;
 visibility: visible !important;
 position: fixed !important;
 top: 0 !important;
 left: 0 !important;
 width: 210mm !important;
 min-height: 297mm !important;
 margin: 0 !important;
 padding: 0 !important;
 z-index: 999999 !important;
 background: white !important;
 }
 #cv-print-target * {
 visibility: visible !important;
 }
 #cv-print-target div,
 #cv-print-target p,
 #cv-print-target h1,
 #cv-print-target h2,
 #cv-print-target h3,
 #cv-print-target span,
 #cv-print-target ul,
 #cv-print-target li,
 #cv-print-target strong,
 #cv-print-target em,
 #cv-print-target img {
 color-adjust: exact !important;
 -webkit-print-color-adjust: exact !important;
 print-color-adjust: exact !important;
 }
 }
 `}</style>
 </>
 );
}