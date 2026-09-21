/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import SlideCommit from '../../../../Shared/components/ReactBits/SlideCommit/SlideCommit';
import React, { useState, useEffect } from 'react';
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { PreviewContext } from '../../../../Website/context/PreviewContext';
import { SiteProvider } from '../../../../Website/context/SiteContext';
import PageHeader from "../../shared/PageHeader/PageHeader";

// Import public components for 1:1 Live Preview
import Home from '../../../../Website/components/HOME/Home';
import About from '../../../../Website/components/NAVBAR/ABOUT/About';
import Programs from '../../../../Website/components/NAVBAR/PROGRAMS/Programs';
import CourseBALLB from '../../../../Website/components/NAVBAR/PROGRAMS/CourseBALLB';
import CourseBBALLB from '../../../../Website/components/NAVBAR/PROGRAMS/CourseBBALLB';
import CourseLLB from '../../../../Website/components/NAVBAR/PROGRAMS/CourseLLB';
import Facilities from '../../../../Website/components/NAVBAR/CAMPUS/FACILITIES/Facilities';
import Contact from '../../../../Website/components/NAVBAR/CONTACT/Contact';
import LeadershipProfile from '../../../../Website/components/NAVBAR/ABOUT/LeadershipProfile/LeadershipProfile';

// Robust helper to perfectly calculate the DOM height of a CSS-scaled component
function ScaledPreview({ scale = 0.35, children }) {
    const containerRef = React.useRef(null);
    const [height, setHeight] = React.useState('auto');

    React.useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setHeight((entry.contentRect.height * scale) + 'px');
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [scale]);

    return (
        <div style={{ height, position: 'relative', overflow: 'hidden' }}>
            <div 
                ref={containerRef}
                style={{ 
                    width: `${100 / scale}%`, 
                    transform: `scale(${scale})`, 
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'auto'
                }}
            >
                {children}
            </div>
        </div>
    );
}

export default function AdminSiteEditor({ isHubView = false }) {
 const [loading, setLoading] = useState(false);
 const [topClicks, setTopClicks] = useState([]);
 
 // Hardcoded structure of the website pages and sections for the CMS schema
 const siteStructure = {
 "/": {
 name: "Home",
 component: <Home />,
 sections: [
 {
 id: "hero",
 name: "Hero Section",
 fields: [
 { key: "title1", label: "Main Title Top", type: "text", placeholder: "e.g. Advancing", fallback: "Advancing" },
 { key: "title2", label: "Main Title Bottom", type: "text", placeholder: "e.g. Integrated Legal Education", fallback: "Integrated Legal Education" },
 { key: "description", label: "Description", type: "textarea", placeholder: "Where rigorous scholarship meets...", fallback: "Where rigorous scholarship meets uncompromising integrity. Shaping the vanguards of modern jurisprudence at Prudentia College of Law." },
 { key: "btn1_text", label: "Primary Button Text", type: "text", placeholder: "e.g. Apply Now", fallback: "Apply Now" },
 { key: "btn1_link", label: "Primary Button Link", type: "select", options: [{label: "Apply Page", value: "/apply"}, {label: "Programs", value: "/programs"}, {label: "About Us", value: "/about"}, {label: "Contact", value: "/contact"}], fallback: "/apply" },
 { key: "btn2_text", label: "Secondary Button Text", type: "text", placeholder: "e.g. Explore Programs", fallback: "Explore Programs" },
 { key: "btn2_link", label: "Secondary Button Link", type: "select", options: [{label: "Programs", value: "/programs"}, {label: "Campus", value: "/campus/facilities"}, {label: "Admissions", value: "/admissions"}], fallback: "/programs" },
 { key: "btn3_text", label: "Tertiary Button Text", type: "text", placeholder: "e.g. Campus", fallback: "Campus" },
 { key: "btn3_link", label: "Tertiary Button Link", type: "select", options: [{label: "Campus", value: "/campus/facilities"}, {label: "About Us", value: "/about"}, {label: "Contact", value: "/contact"}], fallback: "/campus/facilities" }
 ]
 },
 {
 id: "about_snippet",
 name: "About Snippet",
 fields: [
 { key: "tagline", label: "Tagline", type: "text", placeholder: "e.g. Our Philosophy", fallback: "Our Philosophy" },
 { key: "heading1", label: "Heading Line 1", type: "text", placeholder: "e.g. Forging Legal", fallback: "Forging Legal" },
 { key: "heading2", label: "Heading Line 2 (Highlighted)", type: "text", placeholder: "e.g. Excellence.", fallback: "Excellence." },
 { key: "description", label: "Description", type: "textarea", placeholder: "Short description about the college...", fallback: "At Prudentia College of Law, we bridge the gap between academic theory and legal reality. We cultivate an environment where aspiring legal professionals are equipped not just with the knowledge of law, but with the profound understanding of justice." },
 { key: "btn_text", label: "Button Text", type: "text", placeholder: "e.g. Explore Our Legacy", fallback: "Explore Our Legacy" },
 { key: "btn_link", label: "Button Link", type: "select", options: [{label: "About Us", value: "/about"}, {label: "Programs", value: "/programs"}, {label: "Apply Page", value: "/apply"}], fallback: "/about" }
 ]
 },
 {
 id: "academics_snippet",
 name: "Academics Snippet",
 fields: [
 { key: "heading", label: "Heading", type: "text", placeholder: "e.g. Academic Excellence.", fallback: "Academic Excellence." },
 { key: "prog1_title", label: "Program 1 Title", type: "text", fallback: "BA LL.B" },
 { key: "prog1_focus", label: "Program 1 Focus", type: "text", fallback: "Honors" },
 { key: "prog1_duration", label: "Program 1 Duration", type: "text", fallback: "5-Year Integrated" },
 { key: "prog1_desc", label: "Program 1 Description", type: "textarea", fallback: "A holistic program combining Humanities and Law." },
 { key: "prog1_link", label: "Program 1 Link", type: "select", options: [{label: "BA LLB", value: "/programs/ba-llb"}, {label: "BBA LLB", value: "/programs/bba-llb"}, {label: "LLB", value: "/programs/llb"}], fallback: "/programs/ba-llb" },
 { key: "prog2_title", label: "Program 2 Title", type: "text", fallback: "BBA LL.B" },
 { key: "prog2_focus", label: "Program 2 Focus", type: "text", fallback: "Honors" },
 { key: "prog2_duration", label: "Program 2 Duration", type: "text", fallback: "5-Year Corporate" },
 { key: "prog2_desc", label: "Program 2 Description", type: "textarea", fallback: "Integrating Business Management with Legal Studies." },
 { key: "prog2_link", label: "Program 2 Link", type: "select", options: [{label: "BA LLB", value: "/programs/ba-llb"}, {label: "BBA LLB", value: "/programs/bba-llb"}, {label: "LLB", value: "/programs/llb"}], fallback: "/programs/bba-llb" },
 { key: "prog3_title", label: "Program 3 Title", type: "text", fallback: "LL.B" },
 { key: "prog3_focus", label: "Program 3 Focus", type: "text", fallback: "Standard" },
 { key: "prog3_duration", label: "Program 3 Duration", type: "text", fallback: "3-Year Graduate" },
 { key: "prog3_desc", label: "Program 3 Description", type: "textarea", fallback: "A rigorous professional program for graduates." },
 { key: "prog3_link", label: "Program 3 Link", type: "select", options: [{label: "BA LLB", value: "/programs/ba-llb"}, {label: "BBA LLB", value: "/programs/bba-llb"}, {label: "LLB", value: "/programs/llb"}], fallback: "/programs/llb" }
 ]
 },
 {
 id: "advantages_snippet",
 name: "Advantages Snippet",
 fields: [
 { key: "tagline", label: "Tagline", type: "text", fallback: "Why Prudentia" },
 { key: "heading1", label: "Heading Line 1", type: "text", fallback: "The Prudentia" },
 { key: "heading2", label: "Heading Line 2 (Highlighted)", type: "text", fallback: "Advantage." },
 { key: "btn_text", label: "Button Text", type: "text", fallback: "Explore All Facilities" },
 { key: "btn_link", label: "Button Link", type: "select", options: [{label: "Facilities", value: "/campus/facilities"}, {label: "About Us", value: "/about"}, {label: "Programs", value: "/programs"}], fallback: "/campus/facilities" },
 { key: "card1_title", label: "Card 1 Title", type: "text", fallback: "Industry Integration" },
 { key: "card1_desc", label: "Card 1 Description", type: "textarea", fallback: "Exposure to corporate environments, law firms, and tech hubs from the very first year." },
 { key: "card2_title", label: "Card 2 Title", type: "text", fallback: "Practical Training" },
 { key: "card2_desc", label: "Card 2 Description", type: "textarea", fallback: "State-of-the-art moot courts that simulate real-world litigation scenarios." },
 { key: "card3_title", label: "Card 3 Title", type: "text", fallback: "Legal Aid Clinic" },
 { key: "card3_desc", label: "Card 3 Description", type: "textarea", fallback: "Students engage with the community, offering free legal aid and spreading awareness." },
 { key: "card4_title", label: "Card 4 Title", type: "text", fallback: "Integrated Civil Services" },
 { key: "card4_desc", label: "Card 4 Description", type: "textarea", fallback: "Specialized coaching mapped with the curriculum for aspiring judicial officers." }
 ]
 },
 {
 id: "contact_snippet",
 name: "Contact Metrics",
 fields: [
 { key: "heading_line1", label: "Heading Line 1", type: "text", fallback: "Uncompromising" },
 { key: "heading_highlight", label: "Heading Highlight", type: "text", fallback: "Excellence." },
 { key: "heading_line2", label: "Heading Line 2", type: "text", fallback: "Accessible to All." },
 { key: "description", label: "Description", type: "textarea", fallback: "Experience world-class legal education without financial barriers. Join our community of scholars today." },
 { key: "btn_text", label: "Button Text", type: "text", fallback: "Apply Now" },
 { key: "btn_link", label: "Button Link", type: "select", options: [{label: "Apply Page", value: "/apply"}, {label: "Contact", value: "/contact"}], fallback: "/apply" },
 { key: "metric1_value", label: "Metric 1 Number", type: "text", fallback: "240" },
 { key: "metric1_label", label: "Metric 1 Label", type: "text", fallback: "Elite Phase I Scholars" },
 { key: "metric2_value", label: "Metric 2 Number", type: "text", fallback: "100" },
 { key: "metric2_suffix", label: "Metric 2 Suffix", type: "text", fallback: "%" },
 { key: "metric2_label", label: "Metric 2 Label", type: "text", fallback: "Distinguished Faculty" },
 { key: "metric3_value", label: "Metric 3 Number", type: "text", fallback: "1200" },
 { key: "metric3_suffix", label: "Metric 3 Suffix", type: "text", fallback: "+" },
 { key: "metric3_label", label: "Metric 3 Label", type: "text", fallback: "Future Capacity" }
 ]
 }
 ]
 },
 "/about": {
 name: "About Us",
 component: <About />,
 sections: [
 {
 id: "leadership_main",
 name: "Leadership & Core",
 fields: [
 { key: "hero_line1", label: "Hero Line 1", type: "text", fallback: "Shaping the" },
 { key: "hero_highlight", label: "Hero Highlight", type: "text", fallback: "Future of Law." },
 { key: "hero_desc_1", label: "Hero Description 1", type: "textarea", fallback: "Prudentia College of Law, Gurramguda, Hyderabad is established with a vision to nurture a new generation of legal professionals equipped with knowledge, integrity, and leadership." },
 { key: "hero_desc_2", label: "Hero Description 2", type: "textarea", fallback: "Our approach combines strong academic foundations with practical exposure through moot courts, legal aid initiatives, and court visits." },
 { key: "mission", label: "Mission Statement", type: "textarea", fallback: "To provide an elite, integrated legal environment that merges academic brilliance with uncompromising practical training, fostering critical thinkers who will redefine jurisprudence." },
 { key: "vision", label: "Vision Statement", type: "textarea", fallback: "To stand as the definitive institution of legal education in India—nurturing advocates, judges, and policy architects who uphold the Constitution with courage and social conscience." },
 { key: "motto", label: "College Motto", type: "text", fallback: "Excellence in Theory. Command in Practice." },
 { key: "founder_name", label: "Founder Name", type: "text", fallback: "Dr. Sneha Mula" },
 { key: "founder_title", label: "Founder Title", type: "text", fallback: "Founder & Chairman" },
 { key: "cofounder_name", label: "Co-Founder Name", type: "text", fallback: "Mr. Bharat Krishna Buddala" },
 { key: "cofounder_title", label: "Co-Founder Title", type: "text", fallback: "Co-Founder & Secretary" }
 ]
 }
 ]
 },
 "/about/leadership/founder": {
 name: "Founder Profile",
 component: <LeadershipProfile overrideId="founder" />,
 sections: [
 {
 id: "profile",
 name: "Founder Details",
 fields: [
 { key: "name", label: "Name", type: "text", fallback: "Dr. Sneha Mula" },
 { key: "title", label: "Title", type: "text", fallback: "Founder & Chairman – Prudentia College of Law" },
 { key: "eyebrow", label: "Eyebrow Text", type: "text", fallback: "Founder's Vision" },
 { key: "bio", label: "Biography (paragraphs separated by blank lines)", type: "textarea", fallback: "Education is not merely the transfer of knowledge; it is the power to transform lives, communities, and society. Guided by this belief, Dr. Sneha Mula, Founder and Chairman of Prudentia College of Law, envisioned an institution that nurtures not only legal professionals but socially conscious leaders committed to justice.\n\nA distinguished legal academic, researcher, and advocate, Ms. Sneha brings together the rare blend of courtroom experience, academic excellence, and visionary leadership. She completed her B.B.A., LL.B. (Hons.) as a Batch Topper, secured Rank I in LL.M., and qualified UGC-NET and KSET. Her doctoral research focuses on the transformative impact of Artificial Intelligence and Law, reflecting her commitment to preparing legal education for the future. Her academic journey and scholarship span areas including cyber law, privacy, competition law, constitutional values, and emerging technologies. Over the years, Ms. Sneha has served in prestigious institutions across India, including leadership roles as Dean, Head of Department, academic coordinator, mentor, and legal educator. She has trained aspiring lawyers, guided research, introduced academic reforms, organized national competitions, and championed legal awareness and student welfare.\n\nThe inspiration behind Prudentia College of Law is deeply personal and purpose-driven. Rooted in values of education, opportunity, and social responsibility, Ms. Sneha envisioned a law college that bridges theory with practice and builds lawyers who combine professional competence with ethics and compassion. Inspired by a lifelong passion for teaching and a commitment to making quality legal education accessible, she sought to create an institution where talent is encouraged, voices are heard, and justice becomes a lived value rather than merely a subject of study. Under her leadership, Prudentia College of Law aspires to become a centre of academic excellence, innovation, advocacy, and public service empowering students to uphold the rule of law and contribute meaningfully to society." },
 { key: "quote", label: "Quote", type: "textarea", fallback: "Law is not merely a profession, it is a responsibility to protect rights, pursue truth, and shape a more just future. Prudentia College of Law was founded not only to teach law but to inspire fearless minds who will question, lead, and leave a mark on society." },
 { key: "quoteAuthor", label: "Quote Author", type: "text", fallback: "Dr. Sneha Mula" }
 ]
 }
 ]
 },
 "/about/leadership/co-founder": {
 name: "Co-Founder Profile",
 component: <LeadershipProfile overrideId="co-founder" />,
 sections: [
 {
 id: "profile",
 name: "Co-Founder Details",
 fields: [
 { key: "name", label: "Name", type: "text", fallback: "Mr. Bharat Krishna Buddala" },
 { key: "title", label: "Title", type: "text", fallback: "Co-Founder & Managing Director" },
 { key: "eyebrow", label: "Eyebrow Text", type: "text", fallback: "Co-Founder's Vision" },
 { key: "bio", label: "Biography (paragraphs separated by blank lines)", type: "textarea", fallback: "Mr. Bharat Krishna Buddala is a dynamic education visionary and entrepreneur whose journey reflects determination, global learning, and a deep commitment to empowering young minds. Having completed his MBA from Melbourne, Australia, he gained valuable international exposure, leadership skills, and a broader understanding of how education can transform lives and societies.\n\nWhile studying and observing educational systems abroad, Mr. Bharat Krishna developed a strong belief that quality education should not be a privilege reserved for a few, but an opportunity accessible to all deserving students. His experiences inspired him to think beyond professional success and focus on creating a meaningful social impact through education. The inspiration to establish Prudentia College of Law emerged from his conviction that law is not merely a profession but a powerful instrument for justice, leadership, and social change. He envisioned a law college that would nurture students into ethical professionals, confident advocates, and responsible citizens capable of making a difference in society.\n\nMr. Bharat Krishna believes that every student carries untapped potential waiting to be discovered. His vision for Prudentia College of Law is rooted in creating an environment where students are encouraged to dream fearlessly, think critically, and pursue excellence with integrity and compassion. Through Prudentia College of Law, he aspires to build not merely graduates, but future leaders who will uphold justice and contribute meaningfully to society." },
 { key: "quote", label: "Quote", type: "textarea", fallback: "Education creates opportunity, and law gives that opportunity a voice. Our mission is to empower students to become both successful professionals and responsible changemakers." },
 { key: "quoteAuthor", label: "Quote Author", type: "text", fallback: "Mr. Bharat Krishna Buddala" }
 ]
 }
 ]
 },
 "/programs": {
 name: "Programs",
 component: <Programs />,
 sections: [
 {
 id: "intro",
 name: "Introduction",
 fields: [
 { key: "title", label: "Page Title", type: "text", fallback: "Academic Excellence" },
 { key: "content", label: "Description", type: "textarea", fallback: "Where rigorous scholarship meets uncompromising integrity. Shaping the vanguards of modern jurisprudence." }
 ]
 },
 {
 id: "admissions",
 name: "Admissions Info",
 fields: [
 { key: "title", label: "Section Title", type: "text", fallback: "Admissions & Fee Structure" },
 { key: "subtitle", label: "Quote / Subtitle", type: "textarea", fallback: "We are committed to offering quality legal education at affordable fees to underserved communities." },
 { key: "state_counselling_desc", label: "State Counselling Description", type: "text", fallback: "80% Seats via TS LAWCET" },
 { key: "management_desc", label: "Management Quota Description", type: "text", fallback: "20% Seats Direct" },
 { key: "fee_counselling", label: "Counselling Fee", type: "text", fallback: "Rs. 20,000 / yr" },
 { key: "fee_management", label: "Management Fee Info", type: "textarea", fallback: "Fees are subject to incurring expenditure and demand. Contact administration for details." },
 { key: "eligibility_5yr", label: "5-Year Courses Eligibility", type: "textarea", fallback: "Pass in Intermediate (10+2) with min 45% marks (40% for SC/ST)." },
 { key: "eligibility_3yr", label: "3-Year Course Eligibility", type: "textarea", fallback: "Graduate in any discipline (10+2+3 pattern) with min 45% marks." }
 ]
 },
 {
 id: "documents",
 name: "Documents Required",
 fields: [
 { key: "title", label: "Section Title", type: "text", fallback: "Documents Required" },
 { key: "subtitle", label: "Subtitle", type: "textarea", fallback: "Originals and photocopies required at admission." },
 { key: "doc_list", label: "List of Documents (comma separated)", type: "textarea", fallback: "SSC / 10th Class Certificate, Intermediate / 12th Class Certificate, Degree Certificate & Marks Memos (for LL.B 3 Yrs), TS LAWCET Hall Ticket and Rank Card, Transfer Certificate (TC), Conduct / Character Certificate, Aadhaar Card Copy, Recent Passport Size Photographs, Caste & Income Certificate (if applicable)" }
 ]
 },
 {
 id: "collaborations",
 name: "Collaborations",
 fields: [
 { key: "title", label: "Section Title", type: "text", fallback: "Educational Collaborations" },
 { key: "subtitle", label: "Focus Title", type: "text", fallback: "Career Focus & Coaching" },
 { key: "description", label: "Description", type: "textarea", fallback: "We provide specialized coaching integrated with the curriculum to ensure career readiness. Prudentia College of Law, in collaboration with" },
 { key: "partner_name", label: "Partner Highlight Name", type: "text", fallback: "Sarat Chandra IAS Academy" },
 { key: "feature1_title", label: "Feature 1 Title", type: "text", fallback: "Judicial Orientation" },
 { key: "feature1_desc", label: "Feature 1 Description", type: "text", fallback: "Coaching for Junior Civil Judge examinations." },
 { key: "feature2_title", label: "Feature 2 Title", type: "text", fallback: "Civil Services" },
 { key: "feature2_desc", label: "Feature 2 Description", type: "text", fallback: "Preparation for UPSC and Group Services." },
 { key: "feature3_title", label: "Feature 3 Title", type: "text", fallback: "Industry Integration" },
 { key: "feature3_desc", label: "Feature 3 Description", type: "text", fallback: "Orientation with Law Firms and Court Exposure." }
 ]
 }
 ]
 },
 "/programs/bba-llb": {
 name: "BBA. LL.B",
 component: <CourseBBALLB />,
 sections: [
 {
 id: "program_details",
 name: "Program Details",
 fields: [
 { key: "badge1", label: "Badge 1", type: "text", fallback: "5 Years Integrated" },
 { key: "badge2", label: "Badge 2", type: "text", fallback: "Undergraduate" },
 { key: "title", label: "Program Title", type: "text", fallback: "BBA. LL.B" },
 { key: "title_highlight", label: "Title Highlight (Italic)", type: "text", fallback: "Honors" },
 { key: "description", label: "Short Description", type: "textarea", fallback: "Tailored for aspiring corporate leaders, merging business administration with intensive legal education." },
 { key: "overview_text", label: "Program Overview", type: "textarea", fallback: "The BBA. LL.B (Honors) program at Prudentia College of Law is designed to bridge the gap between corporate management and legal compliance. Over five years, students are immersed in a curriculum that seamlessly blends principles of finance, marketing, and human resources with substantive and procedural law. This dual-degree approach ensures graduates are uniquely positioned for roles in corporate litigation, in-house counsel, and international trade law." },
 { key: "focus_1", label: "Focus Area 1", type: "text", fallback: "Corporate Law" },
 { key: "focus_2", label: "Focus Area 2", type: "text", fallback: "Business Management" },
 { key: "focus_3", label: "Focus Area 3", type: "text", fallback: "Contracts" },
 { key: "focus_4", label: "Focus Area 4", type: "text", fallback: "M&A" },
 { key: "focus_5", label: "Focus Area 5", type: "text", fallback: "Taxation" },
 { key: "curriculum_m1_title", label: "Milestone 1 Title", type: "text", fallback: "Years 1 & 2" },
 { key: "curriculum_m1_badge", label: "Milestone 1 Badge", type: "text", fallback: "Foundational Business & Law" },
 { key: "curriculum_m1_desc", label: "Milestone 1 Description", type: "textarea", fallback: "Establishing a strong base in Management Principles, Economics, and foundational Legal Theories." },
 { key: "curriculum_m2_title", label: "Milestone 2 Title", type: "text", fallback: "Years 3 & 4" },
 { key: "curriculum_m2_badge", label: "Milestone 2 Badge", type: "text", fallback: "Core Integration" },
 { key: "curriculum_m2_desc", label: "Milestone 2 Description", type: "textarea", fallback: "Deep dive into Company Law, Labour Laws, Marketing, and Financial Management." },
 { key: "curriculum_m3_title", label: "Milestone 3 Title", type: "text", fallback: "Year 5" },
 { key: "curriculum_m3_badge", label: "Milestone 3 Badge", type: "text", fallback: "Specialization & Clinic" },
 { key: "curriculum_m3_desc", label: "Milestone 3 Description", type: "textarea", fallback: "Advanced electives, corporate internships, drafting, and moot court focus." },
 { key: "fact_duration", label: "Duration Fact", type: "text", fallback: "5 Years / 10 Semesters" },
 { key: "fact_eligibility", label: "Eligibility Fact", type: "text", fallback: "10+2 with 45% (40% SC/ST)" },
 { key: "fact_mode", label: "Admission Mode Fact", type: "text", fallback: "TS LAWCET / Management" }
 ]
 }
 ]
 },
 "/programs/ba-llb": {
 name: "BA. LL.B",
 component: <CourseBALLB />,
 sections: [
 {
 id: "program_details",
 name: "Program Details",
 fields: [
 { key: "badge1", label: "Badge 1", type: "text", fallback: "5 Years Integrated" },
 { key: "badge2", label: "Badge 2", type: "text", fallback: "Undergraduate" },
 { key: "title", label: "Program Title", type: "text", fallback: "BA. LL.B" },
 { key: "title_highlight", label: "Title Highlight (Italic)", type: "text", fallback: "Honors" },
 { key: "description", label: "Short Description", type: "textarea", fallback: "A holistic program combining Humanities and Law to create socially aware legal professionals." },
 { key: "overview_text", label: "Program Overview", type: "textarea", fallback: "The BA. LL.B (Honors) program is a meticulously crafted 5-year integrated course that harmonizes liberal arts with rigorous legal training. By studying subjects like Political Science, Sociology, and Economics alongside constitutional and criminal law, students develop a profound understanding of the socio-economic context in which laws operate. This program is ideal for those aspiring to enter the judiciary, civil services, or public policy." },
 { key: "focus_1", label: "Focus Area 1", type: "text", fallback: "Political Science" },
 { key: "focus_2", label: "Focus Area 2", type: "text", fallback: "Constitutional Law" },
 { key: "focus_3", label: "Focus Area 3", type: "text", fallback: "Sociology" },
 { key: "focus_4", label: "Focus Area 4", type: "text", fallback: "Public Policy" },
 { key: "focus_5", label: "Focus Area 5", type: "text", fallback: "Human Rights" },
 { key: "curriculum_m1_title", label: "Milestone 1 Title", type: "text", fallback: "Years 1 & 2" },
 { key: "curriculum_m1_badge", label: "Milestone 1 Badge", type: "text", fallback: "Foundational Humanities" },
 { key: "curriculum_m1_desc", label: "Milestone 1 Description", type: "textarea", fallback: "Building a strong base in Liberal Arts alongside introductory Legal Systems." },
 { key: "curriculum_m2_title", label: "Milestone 2 Title", type: "text", fallback: "Years 3 & 4" },
 { key: "curriculum_m2_badge", label: "Milestone 2 Badge", type: "text", fallback: "Core Substantive Law" },
 { key: "curriculum_m2_desc", label: "Milestone 2 Description", type: "textarea", fallback: "Intensive study of Criminal, Civil, and Constitutional laws with moot court basics." },
 { key: "curriculum_m3_title", label: "Milestone 3 Title", type: "text", fallback: "Year 5" },
 { key: "curriculum_m3_badge", label: "Milestone 3 Badge", type: "text", fallback: "Clinical & Practice" },
 { key: "curriculum_m3_desc", label: "Milestone 3 Description", type: "textarea", fallback: "Procedural laws, drafting, pleading, conveyancing, and extensive court visits." },
 { key: "fact_duration", label: "Duration Fact", type: "text", fallback: "5 Years / 10 Semesters" },
 { key: "fact_eligibility", label: "Eligibility Fact", type: "text", fallback: "10+2 with 45% (40% SC/ST)" },
 { key: "fact_mode", label: "Admission Mode Fact", type: "text", fallback: "TS LAWCET / Management" }
 ]
 }
 ]
 },
 "/programs/llb": {
 name: "LL.B",
 component: <CourseLLB />,
 sections: [
 {
 id: "program_details",
 name: "Program Details",
 fields: [
 { key: "badge1", label: "Badge 1", type: "text", fallback: "3 Years Standard" },
 { key: "badge2", label: "Badge 2", type: "text", fallback: "Postgraduate Degree" },
 { key: "title", label: "Program Title", type: "text", fallback: "LL.B" },
 { key: "title_highlight", label: "Title Highlight (Italic)", type: "text", fallback: "Standard" },
 { key: "description", label: "Short Description", type: "textarea", fallback: "A rigorous, intensive professional program designed for graduates aspiring to enter legal practice." },
 { key: "overview_text", label: "Program Overview", type: "textarea", fallback: "The 3-Year LL.B program is the traditional pathway to legal practice in India. Designed exclusively for graduates from any discipline, this intensive course dives straight into core legal subjects without the foundational liberal arts or business courses. It emphasizes practical litigation skills, substantive laws, and procedural intricacies, ensuring graduates are courtroom-ready from day one." },
 { key: "focus_1", label: "Focus Area 1", type: "text", fallback: "Litigation" },
 { key: "focus_2", label: "Focus Area 2", type: "text", fallback: "Criminal Law" },
 { key: "focus_3", label: "Focus Area 3", type: "text", fallback: "Civil Procedure" },
 { key: "focus_4", label: "Focus Area 4", type: "text", fallback: "Drafting" },
 { key: "focus_5", label: "Focus Area 5", type: "text", fallback: "Advocacy" },
 { key: "curriculum_m1_title", label: "Milestone 1 Title", type: "text", fallback: "Year 1" },
 { key: "curriculum_m1_badge", label: "Milestone 1 Badge", type: "text", fallback: "Substantive Core" },
 { key: "curriculum_m1_desc", label: "Milestone 1 Description", type: "textarea", fallback: "Contracts, Torts, Constitutional Law, and Family Law fundamentals." },
 { key: "curriculum_m2_title", label: "Milestone 2 Title", type: "text", fallback: "Year 2" },
 { key: "curriculum_m2_badge", label: "Milestone 2 Badge", type: "text", fallback: "Procedural Mastery" },
 { key: "curriculum_m2_desc", label: "Milestone 2 Description", type: "textarea", fallback: "CrPC, CPC, Evidence Act, and specialized substantive subjects like Property Law." },
 { key: "curriculum_m3_title", label: "Milestone 3 Title", type: "text", fallback: "Year 3" },
 { key: "curriculum_m3_badge", label: "Milestone 3 Badge", type: "text", fallback: "Clinical & Trial Advocacy" },
 { key: "curriculum_m3_desc", label: "Milestone 3 Description", type: "textarea", fallback: "Moot courts, drafting, pleading, professional ethics, and internships." },
 { key: "fact_duration", label: "Duration Fact", type: "text", fallback: "3 Years / 6 Semesters" },
 { key: "fact_eligibility", label: "Eligibility Fact", type: "text", fallback: "Degree with 45% (40% SC/ST)" },
 { key: "fact_mode", label: "Admission Mode Fact", type: "text", fallback: "TS LAWCET / Management" }
 ]
 }
 ]
 },
 "/campus/facilities": {
 name: "Facilities",
 component: <Facilities />,
 sections: [
 {
 id: "intro",
 name: "Introduction",
 fields: [
 { key: "title", label: "Page Title", type: "text", fallback: "Campus Infrastructure" },
 { key: "content", label: "Description", type: "textarea", fallback: "Experience a meticulously designed campus that fosters academic rigor and practical legal training." }
 ]
 }
 ]
 },
 "/contact": {
 name: "Contact Us",
 component: <Contact />,
 sections: [
 {
 id: "contact_main",
 name: "Main Information",
 fields: [
 { key: "heading", label: "Heading Line 1", type: "text", fallback: "Get in" },
 { key: "heading_highlight", label: "Heading Highlight (Italic)", type: "text", fallback: "Touch" },
 { key: "subheading", label: "Subheading/Description", type: "textarea", fallback: "Reach out to Prudentia College of Law. Whether you have questions about admissions, our programs, or want to arrange a campus tour, our team is ready to assist you." },
 { key: "address", label: "Campus Address", type: "textarea", fallback: "3-23, Gurramguda, Hyderabad, Telangana 501510" },
 { key: "phone", label: "Phone Number", type: "text", fallback: "+91 8599000777" },
 { key: "email", label: "Email Address", type: "text", fallback: "info@prudentiacollegeoflaw.com" },
 { key: "timings", label: "College Timings", type: "text", fallback: "Monday – Saturday: 9:00 AM – 4:00 PM" }
 ]
 }
 ]
 }
 };

 const [selectedPage, setSelectedPage] = useState("/");
 const [selectedSection, setSelectedSection] = useState("hero");
 const [contentData, setContentData] = useState({});
 const [isSaving, setIsSaving] = useState(false);
 const [fetchError, setFetchError] = useState(false);
 const [localPreviewData, setLocalPreviewData] = useState({});
 const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

 useEffect(() => {
 if (selectedPage && selectedSection) {
 fetchContent();
 }
 }, [selectedPage, selectedSection]);

 useEffect(() => {
 const fetchInteractions = async () => {
 try {
 const query = `SELECT element_text, count(*) as click_count FROM website_clicks GROUP BY element_text ORDER BY click_count DESC LIMIT 5`;
 const { data, error } = await supabase.rpc('admin_exec_sql', { query_text: query });
 if (data && !error) {
 setTopClicks(data.map(d => ({ text: d.element_text, count: d.click_count })));
 }
 } catch (e) {}
 };
 fetchInteractions();
 }, []);

 const fetchContent = async () => {
 setLoading(true);
 setFetchError(false);
 try {
 const { data, error } = await supabase
 .from('website_content')
 .select('content_data')
 .eq('page_path', selectedPage)
 .eq('section_id', selectedSection)
 .maybeSingle();

 if (error) {
 throw error;
 } else {
 let fetchedData = data?.content_data || {};
 
 // Prefill logic to avoid empty blanks
 const currentSectionConfig = siteStructure[selectedPage]?.sections.find(s => s.id === selectedSection);
 if (currentSectionConfig) {
 const populatedData = { ...fetchedData };
 currentSectionConfig.fields.forEach(field => {
 if (populatedData[field.key] === undefined || populatedData[field.key] === null || populatedData[field.key] === "") {
 populatedData[field.key] = field.fallback || "";
 }
 });
 fetchedData = populatedData;
 }
 
 setContentData(fetchedData);
 // Initialize local preview data immediately
 setLocalPreviewData(prev => ({
 ...prev,
 [`${selectedPage}::${selectedSection}`]: fetchedData
 }));
 }
 } catch (err) {
 console.error("Failed to load section content:", err);
 setFetchError(true);
 } finally {
 setLoading(false);
 }
 };

 const handleSave = async () => {
 setIsSaving(true);
 try {
 const { error } = await supabase
 .from('website_content')
 .upsert({
 page_path: selectedPage,
 section_id: selectedSection,
 content_data: contentData,
 updated_at: new Date().toISOString()
 }, { onConflict: 'page_path, section_id' });

 if (error) throw error;
 
 if (window.erpDialog) {
 window.erpDialog.alert("Content saved successfully and is now live on the public website.");
 } else {
 window.erpDialog?.alert("Saved successfully!");
 }
 } catch (err) {
 console.error("Save error:", err);
 if (window.erpDialog) {
 window.erpDialog.alert(`Failed to save content. Ensure database schema is updated. ${err.message}`);
 } else {
 window.erpDialog?.alert("Failed to save content.");
 }
 } finally {
 setIsSaving(false);
 }
 };

 const handleFieldChange = (key, value) => {
 const newData = { ...contentData, [key]: value };
 setContentData(newData);
 
 // Instantly push to preview context
 setLocalPreviewData(prev => ({
 ...prev,
 [`${selectedPage}::${selectedSection}`]: newData
 }));
 };

 const currentSectionConfig = siteStructure[selectedPage]?.sections.find(s => s.id === selectedSection);
 const CurrentPageComponent = siteStructure[selectedPage]?.component;

 // Navigation Tree mapped exactly like the Website Navbar
 const navTree = [
 { label: "Home", path: "/" },
 { 
 label: "About Us", 
 isParent: true,
 path: "/about",
 children: [
 { label: "Overview", path: "/about" },
 { label: "Founder", path: "/about/leadership/founder" },
 { label: "Co-Founder", path: "/about/leadership/co-founder" }
 ] 
 },
 { 
 label: "Programs", 
 isParent: true,
 path: "/programs",
 children: [
 { label: "Overview", path: "/programs" },
 { label: "BA. LL.B", path: "/programs/ba-llb" },
 { label: "BBA. LL.B", path: "/programs/bba-llb" },
 { label: "LL.B", path: "/programs/llb" }
 ] 
 },
 { label: "Campus", path: "/campus/facilities" },
 { label: "Contact", path: "/contact" }
 ];

 const getPreviewProviderValue = () => {
 return {
 previewData: localPreviewData,
 updatePreviewData: () => {}
 };
 };

 return (
 <div className={`w-full h-full flex flex-col gap-4 animate-fade-in relative z-10 selection:bg-themeElevated ${isHubView ? 'bg-transparent text-themeText font-sans' : ''}`}>
 
 {/* Header */}
 {!isHubView && (
 <PageHeader icon="fa-solid fa-globe" title="Site CMS Editor" subtitle="Live 1:1 Preview Content Management" />
 )}

 {/* Custom Horizontal Navbar matching public site */}
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-themeBorder dark:border-white/5 rounded-xl p-2 flex flex-wrap gap-2 relative z-[100]">
 {navTree.map((item, idx) => {
 if (item.isParent) {
 return (
 <div key={idx} className="relative group">
 <button type="button" onClick={(e) => e.preventDefault()} className={`px-4 py-2.5 rounded-lg text-[11px] font-black tracking-normal transition-colors flex items-center gap-2 whitespace-nowrap ${selectedPage.startsWith(item.path) ? 'bg-themeAccent/10 text-themeAccent' : 'text-themeText hover:bg-themeElevated/90 backdrop-blur-2xl'}`}>
 {item.label} <i className="fa-solid fa-chevron-down text-[10px]"></i>
 </button>
 {/* Dropdown */}
 <div className="absolute top-full left-0 mt-1 w-48 bg-themePanel/85 backdrop-blur-2xl border border-themeBorder dark:border-white/5 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-50 overflow-hidden flex flex-col p-1">
 {item.children.map(child => (
 <button type="button" 
 key={child.path}
 onClick={() => { setSelectedPage(child.path); setSelectedSection(siteStructure[child.path].sections[0].id); }}
 className={`px-4 py-3 text-left text-xs font-bold rounded-lg transition-colors ${selectedPage === child.path ? 'bg-themeAccent text-themeText dark:text-white' : 'text-themeText hover:bg-themeElevated/90 backdrop-blur-2xl'}`}
 >
 {child.label}
 </button>
 ))}
 </div>
 </div>
 );
 }
 return (
 <button type="button" 
 key={idx}
 onClick={() => { setSelectedPage(item.path); setSelectedSection(siteStructure[item.path].sections[0].id); }}
 className={`px-4 py-2.5 rounded-lg text-[11px] font-black tracking-normal transition-colors whitespace-nowrap ${selectedPage === item.path ? 'bg-themeAccent text-themeText dark:text-white' : 'text-themeText hover:bg-themeElevated/90 backdrop-blur-2xl'}`}
 >
 {item.label}
 </button>
 )
 })}
 </div>

 {fetchError && (
 <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded text-rose-500">
 <p className="font-bold"><i className="fa-solid fa-triangle-exclamation mr-2"></i> Database Error</p>
 <p className="text-sm mt-1">Failed to fetch content. Ensure that the <code>website_content</code> table has been created.</p>
 </div>
 )}

 {/* Click Tracking Insights */}
 {topClicks.length > 0 && (
 <div className="bg-[#1c1c1c] border border-emerald-500/20 rounded-xl p-4 flex flex-col relative overflow-hidden shrink-0">
 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
 <h2 className="text-[10px] font-black text-emerald-400 tracking-normal mb-3 flex items-center gap-2 relative z-10">
 <i className="fa-solid fa-crosshairs"></i> Exact Click Tracking Insights
 </h2>
 <div className="flex flex-wrap gap-3 relative z-10">
 {topClicks.map((click, idx) => (
 <div key={idx} className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-3">
 <span className="text-[11px] font-bold text-emerald-50 truncate max-w-[200px]">{click.text}</span>
 <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">{click.count} clicks</span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Split Screen Area */}
 <div className="flex flex-col xl:flex-row gap-6 items-start relative">
 
 {/* Left Panel: Editor Form (Sticky) */}
 <div className={`${theme.layout.panel} rounded-themePanel border border-themeBorder dark:border-white/5 p-5 flex flex-col xl:flex-1 shrink-0 max-h-[calc(100vh-4rem)] overflow-y-auto sticky top-6 z-20`}>
 
 {/* Section Selector */}
 <div className="mb-6">
 <label className="block text-[13px] font-medium text-themeTextSec mb-2 pl-1">Page Section</label>
 <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
 {siteStructure[selectedPage]?.sections.map(section => (
 <button type="button"
 key={section.id}
 onClick={() => setSelectedSection(section.id)}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap border shrink-0 ${selectedSection === section.id 
 ? 'bg-themeAccent text-themeText dark:text-white border-themeAccent' 
 : 'bg-themeElevated/90 backdrop-blur-2xl text-themeText border-themeBorder dark:border-white/5 hover:border-black/5 dark:border-white/10'}`}
 >
 {section.name}
 </button>
 ))}
 </div>
 </div>

 <div className="flex justify-between items-center mb-4 pb-2 border-b border-themeBorder dark:border-white/5">
 <h2 className="text-[15px] font-semibold text-themeText tracking-normal">{currentSectionConfig?.name}</h2>
 {loading && <i className="fa-solid fa-circle-notch fa-spin text-themeAccent"></i>}
 </div>

 {/* Form Fields - Scrollable */}
 <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-5">
 {currentSectionConfig?.fields.map(field => (
 <div key={field.key}>
 <label className="block text-[13px] font-medium text-themeTextSec mb-1.5 pl-1">
 {field.label}
 </label>
 {field.type === 'select' ? (
 <select
 value={contentData[field.key] || ""}
 onChange={(e) => handleFieldChange(field.key, e.target.value)}
 className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-themeBorder dark:border-white/5 hover:border-black/5 dark:border-white/10 focus:border-themeAccent focus:ring-1 focus:ring-themeAccent text-themeText rounded-xl px-3 py-2.5 text-xs font-medium transition outline-none"
 >
 <option value="" disabled>Select an option...</option>
 {field.options?.map(opt => (
 <option key={opt.value} value={opt.value}>{opt.label}</option>
 ))}
 </select>
 ) : field.type === 'textarea' ? (
 <textarea
 value={contentData[field.key] || ""}
 onChange={(e) => handleFieldChange(field.key, e.target.value)}
 placeholder={field.placeholder || ""}
 maxLength={field.maxLength || 800}
 rows="4"
 className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-themeBorder dark:border-white/5 hover:border-black/5 dark:border-white/10 focus:border-themeAccent focus:ring-1 focus:ring-themeAccent text-themeText rounded-xl px-3 py-2.5 text-xs font-medium transition outline-none resize-y placeholder:text-themeTextSec/50"
 ></textarea>
 ) : (
 <input
 type={field.type}
 value={contentData[field.key] || ""}
 onChange={(e) => handleFieldChange(field.key, e.target.value)}
 placeholder={field.placeholder || ""}
 maxLength={field.maxLength || 80}
 className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-themeBorder dark:border-white/5 hover:border-black/5 dark:border-white/10 focus:border-themeAccent focus:ring-1 focus:ring-themeAccent text-themeText rounded-xl px-3 py-2.5 text-xs font-medium transition outline-none placeholder:text-themeTextSec/50"
 />
 )}
 </div>
 ))}
 
 {/* Empty Space for scrolling past the bottom */}
 <div className="h-4"></div>
 </div>

 <div className="mt-4 pt-4 border-t border-themeBorder dark:border-white/5">
 <SlideCommit
                label="Slide to Publish"
                doneLabel="Done"
                errorLabel="Failed"
                onConfirm={handleSave}
                trackColor="rgba(28, 28, 30, 0.05)"
                handleColor="#007AFF"
                successColor="#10b981"
                dangerColor="#f43f5e"
                width={200}
                height={48}
                radius={12}
            />
 </div>
 </div>

 {/* Right Panel: Live Preview (w-2/3) */}
 <div className={`transition-all duration-500 overflow-hidden flex flex-col ${isPreviewFullscreen ? 'fixed inset-4 z-[99999] rounded-2xl shadow-2xl border border-white/20 bg-black' : 'w-full xl:w-[500px] shrink-0 bg-black rounded-themePanel border-4 border-black/5 dark:border-white/10 relative'}`}>
 <div className="h-10 bg-[#1e1e1e] w-full flex items-center justify-between px-4 shrink-0 border-b border-black/50 select-none">
 <div className="flex items-center gap-2">
 <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
 <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
 <span className="text-[10px] font-mono text-themeTextSec dark:text-white/50 ml-4 font-bold tracking-widest uppercase">Live Preview — {siteStructure[selectedPage]?.name}</span>
 </div>
 <button type="button" 
 onClick={() => setIsPreviewFullscreen(!isPreviewFullscreen)} 
 className="text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white transition px-2 py-1 flex items-center gap-2 rounded bg-white/5 hover:bg-white/10"
 title={isPreviewFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
 >
 <i className={`fa-solid ${isPreviewFullscreen ? 'fa-compress' : 'fa-expand'} text-[10px]`}></i>
 <span className="text-[13px] font-medium">{isPreviewFullscreen ? "Exit Fullscreen" : "Expand"}</span>
 </button>
 </div>
 
 {/* Robust Dynamic Height Scaler Wrapper */}
 <div className="w-full relative overflow-hidden bg-[#0a0a0a]">
 <ScaledPreview scale={isPreviewFullscreen ? 1 : 0.35}>
 <div className="w-full min-h-screen bg-themeApp">
 <SiteProvider>
 <PreviewContext.Provider value={getPreviewProviderValue()}>
 {CurrentPageComponent ? (
 <div className="min-h-full">
 {React.cloneElement(CurrentPageComponent, { isPreview: true })}
 </div>
 ) : (
 <div className="w-full h-full flex items-center justify-center text-themeTextSec font-mono text-sm">
 No preview component available for this route.
 </div>
 )}
 </PreviewContext.Provider>
 </SiteProvider>
 </div>
 </ScaledPreview>
 </div>
 </div>

 </div>
 
 </div>
 );
}
