/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import ValorLogo from './components/shared/ValorLogo';

import OTPVerification from './components/Login/OTPVerification';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { theme } from '../Shared/theme';
import { useERP } from './context/ErpContext';
import pclLogo from '../Shared/Assets/LOGOS/pcl_logo.svg';

// ==========================================
// 1. AUTH & LAYOUT IMPORTS
// ==========================================
import Login from './components/Login/Login';
import TopNav from './components/shared/TopNav';
import MobileNav from './components/shared/MobileNav';
import Sidebar from './components/Student/sidebar/Sidebar';
import FacultySidebar from './components/Faculty/FacultySidebar/FacultySidebar';
import AdminSidebar from './components/Admin/AdminSidebar/AdminSidebar';

// ==========================================
// 2. SHARED PORTAL MODULES
// ==========================================
import Notices from './components/Student/Notices/Notices';
import Helpdesk from './components/Student/Helpdesk/Helpdesk';
import Credentials from './components/Student/Credentials/Credentials';
import QuestionnaireModal from './components/shared/QuestionnaireModal';
import DialogContainer from './components/shared/DialogContainer';
import CredentialVerification from './components/Public/CredentialVerification';
import GlobalSearch from './components/shared/GlobalSearch';

// ==========================================
// 3. STUDENT PORTAL MODULES
// ==========================================
import StudentDashboard from './components/Student/StudentDashboard/StudentDashboard';
import StudentAcademicHub from './components/Student/StudentAcademicHub/StudentAcademicHub';
import StudentCareerHub from './components/Student/StudentCareerHub/StudentCareerHub';
import StudentSupportHub from './components/Student/StudentSupportHub/StudentSupportHub';

// Standalone Student Components for Expanded Mode
import CourseVault from './components/Student/CourseVault/CourseVault';
import Attendance from './components/Student/Attendance/Attendance';
import Assignments from './components/Student/Assignments/Assignments';
import Timetable from './components/Student/Timetable/Timetable';
import Examinations from './components/Student/Examinations/Examinations';
import Mentorship from './components/Student/Mentorship/Mentorship';
import Internships from './components/Student/Internships/Internships';
import MootCourt from './components/Student/MootCourt/MootCourt';
import Fees from './components/Student/Fees/Fees';
import Leave from './components/Student/Leave/Leave';
import StudentApprovals from './components/Student/Approvals/StudentApprovals';
import Achievements from './components/Student/Achievements/Achievements';
import CVBuilder from './components/Student/CVBuilder/CVBuilder';


// ==========================================
// 4. FACULTY PORTAL MODULES
// ==========================================
import FacultyDashboard from './components/Faculty/FacultyDashboard/FacultyDashboard';
import FacultyAssignments from './components/Faculty/FacultyAssignments/FacultyAssignments';
import FacultyMarks from './components/Faculty/FacultyMarks/FacultyMarks';
import Approvals from './components/Faculty/Approvals/Approvals';

import FacultyAcademicHub from './components/Faculty/FacultyAcademicHub/FacultyAcademicHub';
import FacultyAdvisingHub from './components/Faculty/FacultyAdvisingHub/FacultyAdvisingHub';
import FacultyAdminHub from './components/Faculty/FacultyAdminHub/FacultyAdminHub';

import ClassRoster from './components/Faculty/ClassRoster/ClassRoster';
import FacultyTimetable from './components/Faculty/FacultyTimetable/FacultyTimetable';
import FacultyCourses from './components/Faculty/FacultyCourses/FacultyCourses';
import FacultyMentorship from './components/Faculty/FacultyMentorship/FacultyMentorship';
import FacultyClinicsHub from './components/Faculty/FacultyClinicsHub/FacultyClinicsHub';
import FacultyLeave from './components/Faculty/FacultyLeave/FacultyLeave';
import FacultyAttendance from './components/Faculty/FacultyAttendance/FacultyAttendance';

// ==========================================
// 5. ADMIN PORTAL MODULES
// ==========================================
import AdminDashboard from './components/Admin/AdminDashboard/AdminDashboard';
import UserManagement from './components/Admin/UserManagement/UserManagement';
import AdminCourseBuilder from './components/Admin/AdminTimetableBuilder/AdminCourseBuilder';
import AdminTimetableHQ from './components/Admin/AdminTimetableBuilder/AdminTimetableHQ';
import AdminMentorship from './components/Admin/AdminMentorship/AdminMentorship';
import AdminApprovals from './components/Admin/AdminApprovals/AdminApprovals';
import AdminLeaveManagement from './components/Admin/LeaveManagement/AdminLeaveManagement';
import AdminExaminations from './components/Admin/Examinations/AdminExaminations';
import AdminNotices from './components/Admin/notices/AdminNotices';
import AdminFees from './components/Admin/AdminFees/AdminFees';
import AdminMootCourt from './components/Admin/AdminMootCourt/AdminMootCourt';
import AdminPlacements from './components/Admin/AdminPlacements/AdminPlacements';
import AdminLegalAid from './components/Admin/AdminLegalAid/AdminLegalAid';
import AdminAdmissions from './components/Admin/AdminAdmissions/AdminAdmissions';
import SQLStudio from './components/Admin/AdminDashboard/SQLStudio';
import AdminHelpdesk from './components/Admin/AdminHelpdesk/AdminHelpdesk';
import AdminSiteEditor from './components/Admin/AdminSiteEditor/AdminSiteEditor';
import EventsBoard from './components/notices/EventsBoard';
import AdminOperationsHub from './components/Admin/AdminOperationsHub/AdminOperationsHub';
import AdminAcademicHub from './components/Admin/AdminAcademicHub/AdminAcademicHub';
import AdminClinicsHub from './components/Admin/AdminClinicsHub/AdminClinicsHub';
import AdminWebsiteHub from './components/Admin/AdminWebsiteHub/AdminWebsiteHub';
import SessionTimeoutGuard from './components/shared/SessionTimeoutGuard';
import { RoleActionButton } from './components/shared/LiveHeaderComponents';
import IntelligentBot from './components/shared/IntelligentBot';

export default function App() {
  useEffect(() => {
    const handleFormSubmit = (e) => {
      // Ignore the login form so users don't get prompted when logging in
      if (e.target && e.target.id === 'login-form') return;
      if (e.target && e.target.closest && e.target.closest('.no-confirm-form')) return;
      
      const confirmed = window.confirm("Are you sure you want to submit this?");
      if (!confirmed) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    // Add to window in capture phase to intercept before React
    window.addEventListener("submit", handleFormSubmit, true);
    return () => window.removeEventListener("submit", handleFormSubmit, true);
  }, []);
  const { userSession, isAppLoading, logout, notices, layoutPreference, navLayout } = useERP();
  
  const [needsOtp, setNeedsOtp] = useState(() => {
    const sessionStr = sessionStorage.getItem('jsmerp_session');
    if (!sessionStr) return false;
    
    const lastOtp = localStorage.getItem('erp_otp_verified');
    const OTP_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
    return !lastOtp || (Date.now() - parseInt(lastOtp)) > OTP_EXPIRY;
  });
  const [hasSkippedQuestionnaire, setHasSkippedQuestionnaire] = useState(() => sessionStorage.getItem('skipped_questionnaire') === 'true');

  useEffect(() => {
    if (userSession) {
        const lastOtp = localStorage.getItem('erp_otp_verified');
        const OTP_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
        // Enable OTP check properly
        if (!lastOtp || (Date.now() - parseInt(lastOtp)) > OTP_EXPIRY) {
            setNeedsOtp(true);
        } else {
            setNeedsOtp(false);
        }
    }
  }, [userSession]);



  const navigate = useNavigate();



  const location = useLocation();

  // Derive active tab from URL
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeRole = pathParts[0] || (userSession ? userSession.role : '');
  const activeTab = pathParts[1] || 'dashboard';

  useEffect(() => {
    const container = document.getElementById('jsm-main-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  const setActiveTab = (tab) => {
    if (userSession) {
      navigate(`/${userSession.role}/${tab}`);
    }
  };

  // --- DYNAMIC HEADER FORMATTER ---
  const getPageTitle = (tab) => {
    const titles = {
      dashboard: userSession?.role === 'admin' ? "Master Control" : userSession?.role === 'faculty' ? "Faculty Command Center" : "Student Dashboard",
      credentials: "HR, Profile & Settings",
      helpdesk: "Support Helpdesk",
      notices: userSession?.role === 'admin' ? "Broadcast Center" : "Digital Notice Board",

      attendance: "Attendance Tracker",
      coursevault: "Course Vault",
      timetable: userSession?.role === 'faculty' ? "My Teaching Schedule" : "Academic Schedule & Hub",
      assignments: userSession?.role === 'faculty' ? "Assignment Engine" : "Assignment Portal",
      examinations: "Examinations Hub",
      bidding: "Elective Bidding",
      internships: "Internships & Training",
      mootcourt: "Moot Court Society",
      achievements: "Achievements Hub",
      cvbuilder: "Career & CV Builder",
      fees: "Fee Management",
      leave: "Leave Applications",

      roster: "Class Roster & Attendance",
      marks: "Official Marks Ledger",
      courses: userSession?.role === 'faculty' ? "My Courses" : "Course Vault",
      materials: userSession?.role === 'faculty' ? "My Courses" : "Course Vault",
      mentorship: "Mentorship & Advising",
      approvals: "Student Approvals",
      facultyleave: "Time Off & Leaves",

      users: "Identity & Access Management",
      curriculum: "Master Timetable Builder",
      allocations: "Mentor Allocations",
      adminapprovals: "Central Approvals",
      adminexaminations: "Examinations Center",
      finance: "Finance Ledger",
      adminmootcourt: "Moot Court Society",
      placements: "Placements & Internships",
      legalaid: "Legal Aid Clinic",
      admincredentials: "Admin Identity & Security"
    };
    return titles[tab] || tab.replace('-', ' ');
  };

  const getThemeColors = () => {
    if (userSession?.role === 'admin') return { text: 'text-indigo-500', bg: 'bg-indigo-500', border: 'border-indigo-500' };
    if (userSession?.role === 'faculty') return { text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500' };
    return { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500' };
  };
  const roleColors = getThemeColors();

  if (isAppLoading) {
    return (
      <div className="w-full h-screen bg-themeApp flex flex-col items-center justify-center selection:bg-themePanel">
        <div 
          style={{
            width: '64px', 
            height: '64px', 
            backgroundColor: '#262626', /* neutral-800 equivalent */
            WebkitMaskImage: `url(${pclLogo})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            marginBottom: '1.5rem'
          }} 
        />
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-circle-notch fa-spin text-xl text-neutral-500"></i>
          <h1 className="text-xl font-black tracking-widest text-themeText uppercase">Initializing ERP System...</h1>
        </div>
      </div>
    );
  }

  if (userSession && needsOtp) {
      return <OTPVerification email={userSession.email || 'user@prudentiacollege.edu'} onVerify={() => setNeedsOtp(false)} onLogout={logout} />;
  }

  if (!userSession) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const renderContent = () => {
    const role = userSession.role;

    // 🟢 STUDENT ROUTES
    if (role === 'student') {
      switch (activeTab) {
        case 'dashboard': return <StudentDashboard setActiveTab={setActiveTab} />;
        case 'notices': return <Notices />;
        // Compact Hubs
        case 'academic_center': return <StudentAcademicHub />;
        case 'career_center': return <StudentCareerHub />;
        case 'support_center': return <StudentSupportHub />;
        // Granular (Expanded Mode)
        case 'vault': return <CourseVault />;
        case 'attendance': return <Attendance />;
        case 'assignments': return <Assignments />;
        case 'timetable': return <Timetable />;
        case 'examinations': return <Examinations />;
        case 'mentorship': return <Mentorship />;
        case 'internships': return <Internships />;
        case 'mootcourt': return <MootCourt />;
        case 'fees': return <Fees />;
        case 'leave': return <Leave />;
        case 'approvals': return <StudentApprovals />;
        case 'helpdesk': return <Helpdesk />;
        case 'achievements': return <Achievements />;
        case 'cvbuilder': return <CVBuilder />;
        
        case 'credentials': return <Credentials />;
        default: return <ModuleUnderConstruction tabName={activeTab} role="Student" />;
      }
    }

    // 🔵 FACULTY ROUTES
    if (role === 'faculty') {
      switch (activeTab) {
        case 'dashboard': return <FacultyDashboard setActiveTab={setActiveTab} />;
        case 'notices': return <Notices />;
        
        // Mobile Hubs
        case 'faculty_academic_center': return <FacultyAcademicHub />;
        case 'faculty_advising_center': return <FacultyAdvisingHub />;
        case 'faculty_admin_center': return <FacultyAdminHub />;

        // Standalone Desktop/Direct Routes
        case 'timetable': return <FacultyTimetable setActiveTab={setActiveTab} />;
        case 'attendance': return <FacultyAttendance />;
        case 'roster': return <ClassRoster />;
        case 'courses':
        case 'materials': return <FacultyCourses setActiveTab={setActiveTab} />;
        case 'assignments': return <FacultyAssignments />;
        case 'marks': return <FacultyMarks />;
        
        case 'mentorship': return <FacultyMentorship />;
        case 'clinics': return <FacultyClinicsHub />;
        
        case 'facultyleave': return <FacultyLeave />;
        case 'approvals': return <Approvals />;
        
        case 'helpdesk': return <Helpdesk />;
        case 'credentials': return <Credentials />;
        default: return <ModuleUnderConstruction tabName={activeTab} role="Faculty" />;
      }
    }

    // 🟣 ADMIN ROUTES
    if (role === 'admin') {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard setActiveTab={setActiveTab} />;
        case 'operations': return <AdminOperationsHub />;
        case 'academic': return <AdminAcademicHub />;
        case 'clinics': return <AdminClinicsHub />;
        case 'website': return <AdminWebsiteHub />;
        case 'notices': return <Notices setActiveTab={setActiveTab} />;
        case 'users': return <UserManagement />;
        case 'coursebuilder': return <AdminCourseBuilder />;
        case 'timetablebuilder': return <AdminTimetableHQ />;
        case 'allocations': return <AdminMentorship />;
        case 'adminapprovals': return <AdminApprovals />;
        case 'leavemanagement': return <AdminLeaveManagement />;
        case 'examinations': return <AdminExaminations />;
        case 'finance': return <AdminFees />;
        case 'mootcourt': return <AdminMootCourt />;
        case 'placements': return <AdminPlacements />;
        case 'legalaid': return <AdminLegalAid />;
        case 'adminadmissions': return <AdminAdmissions />;
        case 'sql': return <SQLStudio />;
        case 'helpdesk': return <AdminHelpdesk />;
        case 'siteeditor': return <AdminSiteEditor />;
        case 'events': return <EventsBoard />;
        case 'credentials': return <Credentials />;
        default: return <ModuleUnderConstruction tabName={activeTab} role="Admin" />;
      }
    }

    return <ModuleUnderConstruction tabName={activeTab} role="Unknown" />;
  };

  // --- PROTECTED LAYOUT WRAPPER ---
  const renderLayout = (requiredRole) => {
    // 🛡️ STRICT ROLE-BASED GUARDING
    if (userSession.role !== requiredRole) {
      return <Navigate to={`/${userSession.role}/dashboard`} replace />;
    }

    return (
      <SessionTimeoutGuard>
        <DialogContainer />
        <div className={`flex ${navLayout === 'classic' ? 'flex-row' : 'flex-col'} h-screen w-full bg-themeApp text-themeText premium-bg font-sans overflow-hidden selection:bg-themeAccent/20`}>
          
          {/* CLASSIC SIDEBAR RENDER (Desktop Only) */}
          {navLayout === 'classic' && (
            <div className="hidden lg:block h-full">
              {userSession.role === 'student' && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} userSession={userSession} />}
              {userSession.role === 'faculty' && <FacultySidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} userSession={userSession} />}
              {userSession.role === 'admin' && <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} userSession={userSession} />}
            </div>
          )}

          {/* TOP NAV RENDER (Universal Desktop & Mobile Header) */}
          <div className={navLayout === 'classic' ? "block lg:hidden" : "block"}>
            <TopNav userSession={userSession} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
          </div>

          {/* MOBILE NAV (Bottom Bar & Drawer Menu) - Active when using TopNav Layout */}
          {<MobileNav userSession={userSession} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />}

            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-themeApp relative min-w-0">
              <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar relative z-10 flex flex-col" id="jsm-main-scroll-container">
                {/* Spacer for TopNav - Always present on Mobile because TopNav is always the mobile header! */}
                <div className={`shrink-0 w-full pointer-events-none transition duration-500 ${navLayout === 'classic' ? 'block lg:hidden h-[72px]' : 'block h-[72px] lg:h-[84px]'}`}></div>

                <div className="flex-1 p-4 pt-[calc(1rem+env(safe-area-inset-top))] lg:p-6 lg:pt-6 flex flex-col relative z-10">
                  {renderContent()}
                </div>

              {/* ERP Footer with Privacy & Terms */}
              <div className="w-full shrink-0 flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-themeBorder bg-themePanel/30 text-xs font-medium text-themeTextSec mt-auto z-10 relative">
                <div className="flex gap-4 mb-2 sm:mb-0">
                  <a href="/privacy" target="_blank" className="hover:text-themeText transition-colors">Privacy Policy</a>
                  <a href="/terms" target="_blank" className="hover:text-themeText transition-colors">Terms of Service</a>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="opacity-50">&copy; {new Date().getFullYear()}</span>
                    <ValorLogo className="scale-[0.5] origin-left -ml-1 -mr-6" />
                    <span className="opacity-50">Data Processor.</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SessionTimeoutGuard>
    );
  };

  const handleQuestionnaireComplete = (data) => {
    // Update local session so it dismisses
    const updatedSession = { ...userSession, questionnaire_completed: true };
    // Force a reload to cleanly apply state
    window.location.reload();
  };

  return (
    <>
      <Routes>
        <Route path="/verify/:id" element={<CredentialVerification />} />
        <Route path="/student/*" element={renderLayout("student")} />
        <Route path="/faculty/*" element={renderLayout("faculty")} />
        <Route path="/admin/*" element={renderLayout("admin")} />
        <Route path="*" element={<Navigate to={`/${userSession?.role || 'student'}/dashboard`} replace />} />
      </Routes>

      {/* Mandatory Onboarding Lockout for Students */}
      {userSession?.role === 'student' && userSession.questionnaire_completed === false && !hasSkippedQuestionnaire && (
        <QuestionnaireModal onComplete={handleQuestionnaireComplete} onSkip={() => { setHasSkippedQuestionnaire(true); sessionStorage.setItem("skipped_questionnaire", "true"); }} />
      )}
      
      {userSession && !isAppLoading && <IntelligentBot />}
    </>
  );
}

function ModuleUnderConstruction({ tabName, role }) {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in">
      <div className={`${theme.layout.panel} rounded-themePanel p-8`}>
      <div className="flex items-center gap-4 mb-6">
        <div className={`${theme.ui.logoBox} text-rose-500 text-xl border-themeBorderStrong bg-themePanel`}>
          <i className="fa-solid fa-layer-group"></i>
        </div>
        <div>
          <h3 className={`${theme.text.heading} text-xl text-themeText capitalize`}>
            {tabName.replace('-', ' ')} Module
          </h3>
          <p className={theme.text.secondary}>
            Workspace restricted to {role} accounts.
          </p>
        </div>
      </div>
      <div className={`p-6 border-theme border-dashed border-neutral-800 rounded-themePanel bg-themeApp flex flex-col items-center justify-center text-center py-24 `}>
        <i className={`fa-solid fa-code text-5xl ${theme.text.muted} mb-4`}></i>
        <h4 className={`${theme.text.heading} text-xl text-themeText mb-2`}>Module Under Construction</h4>
        <p className={`${theme.text.secondary} text-sm max-w-md leading-relaxed`}>
          The <span className="font-black text-themeText">{tabName}</span> component is currently being developed for the {role} portal. Please select another module from the sidebar.
        </p>
      </div>
    </div>
    </div>
  );
}