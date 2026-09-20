import re

with open('src/ERP/components/Student/CVBuilder/CVBuilder.jsx', 'r') as f:
    content = f.read()

modern_replacement = '''const ModernTemplate = (data, config) => {
  const HS = { color: "#d97706", fontSize: "11pt", fontWeight: 800, borderBottom: "1px solid #fde68a", paddingBottom: "4px" };
  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", color: "#1e293b", lineHeight: 1.5 }}>
      <div style={{ borderBottom: "4px solid #f59e0b", paddingBottom: "16px", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28pt", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", color: "#0f172a", margin: "0 0 8px" }}>
          {data.personal.name}
        </h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", fontSize: "9pt", fontWeight: 500, color: "#64748b" }}>
          <span style={{ fontWeight: 800, color: "#d97706", letterSpacing: "0.05em" }}>{data.academic.degree}</span>
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.phone && data.personal.phone !== "Update in Profile" && <span>• {data.personal.phone}</span>}
          {data.personal.linkedin && data.personal.linkedin !== "Update in Profile" && <span>• {data.personal.linkedin}</span>}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <SectionHeading text="Education" style={HS} />
        <EntryRow left={data.academic.university} right={data.academic.duration} />
        <SubLine style={{ fontWeight: 600, color: "#334155" }}>{data.academic.degree}</SubLine>
        <Bullet
          items={[
            ...(config.includeCGPA && data.academic.cgpa && data.academic.cgpa !== "Awaiting Data" ? [`Cumulative GPA: ${data.academic.cgpa}`] : []),
            ...(config.includeClassRank && data.academic.rank && data.academic.rank !== "N/A" ? [`University Batch Rank: ${data.academic.rank}`] : []),
          ]}
        />
      </div>

      {config.includeExperience && data.experience.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <SectionHeading text="Legal Experience" style={HS} />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "16px", pageBreakInside: "avoid" }}>
              <EntryRow left={exp.company_name} right={exp.duration} />
              <SubLine style={{ fontWeight: 600, color: "#475569" }}>
                {exp.role_title}
                {exp.location ? ` • ${exp.location}` : ""}
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

      <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
        <p style={{ fontSize: "6.5pt", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "#94a3b8", margin: 0 }}>
          Officially Verified & Minted • Prudentia College of Law
        </p>
        <p style={{ fontSize: "6pt", fontWeight: 600, color: "#cbd5e1", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.15em" }}>
          Document ID: {data.docId}
        </p>
      </div>
    </div>
  );
};'''

pattern = r'const ModernTemplate = \(data, config\) => \{.*?^\};'
content = re.sub(pattern, modern_replacement, content, flags=re.MULTILINE | re.DOTALL)

with open('src/ERP/components/Student/CVBuilder/CVBuilder.jsx', 'w') as f:
    f.write(content)

