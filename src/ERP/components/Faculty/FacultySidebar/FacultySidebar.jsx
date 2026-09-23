/* © 2026 JSM VALOR. All Rights Reserved. */
import React from "react";
import SidebarFramework from "../../shared/Navigation/SidebarFramework";

export const FACULTY_NAV_MEGA = [
  {
    category: "Command Center",
    links: [
      { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-server" },
      { id: "teaching_hub", label: "Academic Hub", icon: "fa-solid fa-graduation-cap" },
      {
        id: "advising_group", label: "Advising & Guidance", icon: "fa-solid fa-people-arrows",
        children: [
          { id: "mentorship", label: "Mentorship Hub", icon: "fa-solid fa-handshake" },
          { id: "clinics", label: "Clinics & Societies", icon: "fa-solid fa-scale-balanced" }
        ]
      },
      {
        id: "admin_group", label: "HR & Administration", icon: "fa-solid fa-building-columns",
        children: [
          { id: "payroll", label: "My Payroll", icon: "fa-solid fa-file-invoice-dollar" },
          { id: "facultyleave", label: "Leave Requests", icon: "fa-solid fa-mug-hot" },
          { id: "notices", label: "Notice Board", icon: "fa-solid fa-thumbtack" },
          { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-laptop-medical" }
        ]
      }
    ]
  }
];

const BOTTOM_NAV_LINKS = [
  { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
  { id: "teaching_hub", label: "Teaching Hub", icon: "fa-solid fa-graduation-cap" },
  { id: "mentorship", label: "Mentorship", icon: "fa-solid fa-people-arrows" },
  { id: "facultyleave", label: "Admin", icon: "fa-solid fa-building-columns" }
];

export default function FacultySidebar({ userSession, activeTab, setActiveTab, onLogout }) {
  return (
    <SidebarFramework 
      config={FACULTY_NAV_MEGA}
      bottomLinks={BOTTOM_NAV_LINKS}
      userSession={userSession}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={onLogout}
      customBrandContext="Faculty"
    />
  );
}
