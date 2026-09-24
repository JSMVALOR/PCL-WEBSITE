/* © 2026 JSM VALOR. All Rights Reserved. */
import React from "react";
import SidebarFramework from "../../shared/Navigation/SidebarFramework";

export const STUDENT_NAV_MEGA = [
  {
    category: "Command Center",
    links: [
      { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-server" },
      { id: "academic_center", label: "Academics", icon: "fa-solid fa-graduation-cap" },
      {
        id: "mentorship_group", label: "Mentorship", icon: "fa-solid fa-handshake",
        children: [
          { id: "mentorship", label: "Mentorship Hub", icon: "fa-solid fa-people-arrows" },
          { id: "leave", label: "Leave Requests", icon: "fa-solid fa-mug-hot" },
          { id: "grievances", label: "Grievances", icon: "fa-solid fa-scale-balanced" }
        ]
      },
      {
        id: "career_group", label: "Career & Advising", icon: "fa-solid fa-briefcase",
        children: [
          { id: "internships", label: "Internships", icon: "fa-solid fa-building" },
          { id: "portfolio", label: "Achievements & CV", icon: "fa-solid fa-trophy" }
        ]
      },
      {
        id: "clinics_group", label: "Clinics & Programs", icon: "fa-solid fa-scale-balanced",
        children: [
          { id: "mootcourt", label: "Moot Courts", icon: "fa-solid fa-scale-balanced" }
        ]
      },
      {
        id: "support_group", label: "Support & Admin", icon: "fa-solid fa-headset",
        children: [
          { id: "fees", label: "Fee Ledgers", icon: "fa-solid fa-indian-rupee-sign" },
          { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-laptop-medical" },
          { id: "notices", label: "Notice Board", icon: "fa-solid fa-thumbtack" }
        ]
      }
    ]
  }
];

const BOTTOM_NAV_LINKS = [
  { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
  { id: "academic_center", label: "Academics", icon: "fa-solid fa-graduation-cap" },
  { id: "internships", label: "Career", icon: "fa-solid fa-briefcase" },
  { id: "fees", label: "Support", icon: "fa-solid fa-building-columns" }
];

export default function Sidebar({ userSession, activeTab, setActiveTab, onLogout }) {
  return (
    <SidebarFramework 
      config={STUDENT_NAV_MEGA}
      bottomLinks={BOTTOM_NAV_LINKS}
      userSession={userSession}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={onLogout}
      customBrandContext="Student"
    />
  );
}
