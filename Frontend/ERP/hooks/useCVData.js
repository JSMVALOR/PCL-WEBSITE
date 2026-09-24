/* © 2026 JSM VALOR. All Rights Reserved. */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../Shared/lib/supabase/supabaseClient';

export default function useCVData(studentId) {
    const [erpData, setErpData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!studentId) return;
        setIsLoading(true);

        try {
            const [profileRes, analyticsRes, expRes, achRes] = await Promise.all([
                supabase.from("profiles").select("*").eq("id", studentId).single(),
                supabase.from("student_semester_analytics").select("*").eq("student_id", studentId).order("declared_on", { ascending: false }).limit(1).single(),
                supabase.from("student_experiences").select("*").eq("student_id", studentId).order("created_at", { ascending: false }),
                supabase.from("student_achievements").select("*").eq("student_id", studentId).eq("is_verified", true).order("date_achieved", { ascending: false }),
            ]);

            const profile = profileRes.data || {};
            const analytics = analyticsRes.data || {};
            const experiences = expRes.data || [];
            const allAch = achRes.data || [];

            const idMatch = profile.erp_id?.match(/^(\d{2})/);
            const admYear = idMatch ? 2000 + parseInt(idMatch[1], 10) : new Date().getFullYear() - 3;
            const isLLM = profile.academic_batch?.toUpperCase().includes("LLM");
            const gradYear = admYear + (isLLM ? 1 : 5);

            const newData = {
                personal: {
                    name: profile.full_name || "Student",
                    email: profile.email || "",
                    phone: profile.phone || "Update in Profile",
                    linkedin: profile.linkedin_url || "Update in Profile" },
                academic: {
                    degree: profile.department || (isLLM ? "LL.M. (Master of Laws)" : "B.B.A. LL.B. (Hons.)"),
                    university: "JSM University, School of Law",
                    duration: `${admYear} – ${gradYear}`,
                    cgpa: analytics.cgpa ? `${analytics.cgpa.toFixed(2)} / 10.0` : "Awaiting Data",
                    rank: analytics.batch_rank ? `${analytics.batch_rank} / ${analytics.batch_total}` : "N/A" },
                experience: experiences,
                mootCourt: allAch.filter((a) => a.category === "Moot Court"),
                awards: allAch.filter((a) => a.category === "Awards"),
                publications: allAch.filter((a) => a.category === "Publications"),
                certifications: allAch.filter((a) => a.category === "Certifications"),
                extracurriculars: allAch.filter((a) => a.category === "Extracurriculars"),
                docId: `${profile.id}-${new Date().getFullYear()}` };

            setErpData(newData);
        } catch (err) {
            console.error("useCVData fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { erpData, isLoading };
}
