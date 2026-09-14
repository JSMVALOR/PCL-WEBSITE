import React from 'react';
/* © 2026 JSM VALOR. All Rights Reserved. */
import { Routes, Route, useLocation } from 'react-router-dom';
import SEO from './Website/components/SEO/SEO';
import Navbar from './Website/components/NAVBAR/Navbar';
import PremiumFooter from './Website/components/UI/PremiumFooter/PremiumFooter';
import Home from './Website/components/HOME/Home';
const About = React.lazy(() => import('./Website/components/NAVBAR/ABOUT/About'));
import LeadershipProfile from './Website/components/NAVBAR/ABOUT/LeadershipProfile/LeadershipProfile';
import NotFound404 from './Website/components/UI/NotFound404';
const GoverningBody = React.lazy(() => import('./Website/components/NAVBAR/ABOUT/GoverningBody'));
const JudiciaryPrep = React.lazy(() => import('./Website/components/NAVBAR/PROGRAMS/JudiciaryPrep'));
const CampusLife = React.lazy(() => import('./Website/components/NAVBAR/CAMPUS/CampusLife'));

import Gallery from './Website/components/NAVBAR/CAMPUS/Gallery/Gallery';
import ScrollToTop from './Website/components/UI/ScrollToTop';
import UnifiedDisclaimer from './Website/components/UI/UnifiedDisclaimer';
import Affiliations from './Website/components/NAVBAR/ABOUT/Affiliations';
const Careers = React.lazy(() => import('./Website/components/NAVBAR/CAREERS/Careers'));
import PlacementCell from './Website/components/NAVBAR/CAREERS/PlacementCell';
const Programs = React.lazy(() => import('./Website/components/NAVBAR/PROGRAMS/Programs'));
const CourseBALLB = React.lazy(() => import('./Website/components/NAVBAR/PROGRAMS/CourseBALLB'));
const CourseBBALLB = React.lazy(() => import('./Website/components/NAVBAR/PROGRAMS/CourseBBALLB'));
const CourseLLB = React.lazy(() => import('./Website/components/NAVBAR/PROGRAMS/CourseLLB'));
const Faculty = React.lazy(() => import('./Website/components/NAVBAR/ABOUT/Faculty'));
import FacultyProfile from './Website/components/NAVBAR/ABOUT/FacultyProfile';
const Facilities = React.lazy(() => import('./Website/components/NAVBAR/CAMPUS/FACILITIES/Facilities'));
import FacilityDetail from './Website/components/NAVBAR/CAMPUS/FACILITIES/FacilityDetail';
import Library from './Website/components/NAVBAR/CAMPUS/LIBRARY/Library';
import MootCourt from './Website/components/NAVBAR/CAMPUS/MOOT_COURT/MootCourt';
import LegalAid from './Website/components/NAVBAR/CAMPUS/LEGAL_AID/LegalAid';
import Contact from "./Website/components/NAVBAR/CONTACT/Contact";
import EventsPage from "./Website/components/NAVBAR/EVENTS/EventsPage";
import EventDetail from "./Website/components/NAVBAR/EVENTS/EventDetail";
import BlogsPage from './Website/components/NAVBAR/BLOGS/BlogsPage';
import BlogDetail from './Website/components/NAVBAR/BLOGS/BlogDetail';
import SubmitBlog from './Website/components/NAVBAR/BLOGS/SubmitBlog';
import ApplyNow from './Website/components/NAVBAR/APPLY_NOW/ApplyNow';
import TermsAndConditions from './Website/components/LEGAL/TermsAndConditions';
import PrivacyPolicy from './Website/components/LEGAL/PrivacyPolicy';
import WebsiteTracker from './Website/components/UI/WebsiteTracker';

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <WebsiteTracker />
            <ScrollToTop />
      <UnifiedDisclaimer />
            <Routes>
        <Route path="/" element={<><SEO title="Home | Prudentia College of Law" description="Premier legal education institution offering BA LLB, BBA LLB, and LLB programs with practical moot court experience." jsonLd={{ "@context": "https://schema.org", "@type": "CollegeOrUniversity", "name": "Prudentia College of Law", "url": "https://prudentiacollegeoflaw.com" }} /><Navbar /><main><Home /></main></>} />
        
        <Route path="/about" element={<><SEO title="About Us" description="Learn about the history, vision, and mission of Prudentia College of Law." /><Navbar /><About /></>} />
        <Route path="/about/leadership" element={<><SEO title="Leadership" description="Meet the leadership team at Prudentia College of Law." /><Navbar /><About /></>} />
        <Route path="/about/leadership/:id" element={<LeadershipProfile />} />
        <Route path="/about/faculty" element={<><SEO title="Our Faculty" description="Meet the experienced legal professionals and academic scholars at Prudentia College of Law." /><Navbar /><Faculty /></>} />
        <Route path="/about/faculty/:id" element={<><Navbar /><FacultyProfile /></>} />
        <Route path="/about/governing-body" element={<><SEO title="Governing Body" description="The distinguished governing body of Prudentia College of Law." /><Navbar /><GoverningBody /></>} />
        <Route path="/about/affiliations" element={<><SEO title="Affiliations" description="Our academic and professional affiliations." /><Navbar /><Affiliations /></>} />
        
        <Route path="/programs" element={<><SEO title="Programs & Degrees" description="Explore our comprehensive BA LLB, BBA LLB, and LLB degree programs." /><Navbar /><Programs /></>} />
        <Route path="/programs/ba-llb" element={<><SEO title="BA LLB Program" description="5-year integrated Bachelor of Arts and Bachelor of Legislative Law program." /><Navbar /><CourseBALLB /></>} />
        <Route path="/programs/bba-llb" element={<><SEO title="BBA LLB Program" description="5-year integrated Bachelor of Business Administration and Bachelor of Legislative Law program." /><Navbar /><CourseBBALLB /></>} />
        <Route path="/programs/llb" element={<><SEO title="LLB Program" description="3-year intensive Bachelor of Legislative Law program." /><Navbar /><CourseLLB /></>} />
        <Route path="/programs/judiciary" element={<><SEO title="Judiciary Preparation" description="Specialized coaching for judicial services examinations." /><Navbar /><JudiciaryPrep /></>} />
        
        <Route path="/campus" element={<><SEO title="Campus Life" description="Experience the vibrant campus life at Prudentia College of Law." /><Navbar /><CampusLife /></>} />
        <Route path="/campus/facilities" element={<><SEO title="Campus Facilities" description="Explore our modern library, moot courts, and student facilities." /><Navbar /><Facilities /></>} />
        <Route path="/campus/facilities/:id" element={<><Navbar /><FacilityDetail /></>} />
        <Route path="/campus/gallery" element={<><SEO title="Gallery" description="Take a visual tour of our campus and events." /><Gallery /></>} />
        <Route path="/campus/moot-court" element={<><SEO title="Moot Court" description="State-of-the-art moot court facilities for practical legal training." /><Navbar /><MootCourt /></>} />
        <Route path="/campus/legal-aid" element={<><SEO title="Legal Aid Clinic" description="Providing pro-bono legal services to the community." /><Navbar /><LegalAid /></>} />
        <Route path="/campus/library" element={<><SEO title="Library" description="Extensive legal library with thousands of physical and digital resources." /><Navbar /><Library /></>} />
        
        <Route path="/careers" element={<><SEO title="Careers" description="Join the faculty or administrative team at Prudentia College of Law." /><Navbar /><Careers /></>} />
        <Route path="/careers/placement" element={<><SEO title="Placement Cell" description="Dedicated placement cell ensuring outstanding career opportunities for our students." /><Navbar /><PlacementCell /></>} />

        <Route path="/events" element={<><SEO title="Events" description="Stay updated with the latest events and academic conferences at Prudentia College of Law." /><Navbar /><EventsPage /></>} />
        <Route path="/events/:id" element={<><Navbar /><EventDetail /></>} />
        <Route path="/blogs" element={<><SEO title="Legal Blogs" description="Read insightful articles and legal analysis from our faculty and students." /><Navbar /><BlogsPage /></>} />
        <Route path="/blogs/submit" element={<><SEO title="Submit a Blog" description="Submit your legal articles for publication on the Prudentia College of Law blog." /><Navbar /><SubmitBlog /></>} />
        <Route path="/blogs/:id" element={<><Navbar /><BlogDetail /></>} />

        <Route path="/contact" element={<><SEO title="Contact Us" description="Get in touch with Prudentia College of Law for admissions, inquiries, or support." /><Navbar /><Contact /></>} />
        <Route path="/apply" element={<><SEO title="Apply Now" description="Start your application for Prudentia College of Law." /><ApplyNow /></>} />
        <Route path="/terms" element={<><SEO title="Terms and Conditions" description="Terms and conditions for using the Prudentia College of Law website." /><TermsAndConditions /></>} />
        <Route path="/privacy" element={<><SEO title="Privacy Policy" description="Privacy policy regarding user data on the Prudentia College of Law website." /><PrivacyPolicy /></>} />

        <Route path="*" element={<NotFound404 />} />
      </Routes>
      {!isHome && <PremiumFooter />}
    </>
  )
}

export default App
