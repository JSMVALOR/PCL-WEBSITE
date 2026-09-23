/* © 2026 JSM VALOR. All Rights Reserved. */
import React from "react";
import SidebarFramework from "../../shared/Navigation/SidebarFramework";

export const FACULTY_NAV_MEGA = [
  {
    category: "Main",
    links: [
      { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
      { id: "notices", label: "Notice Board", icon: "fa-solid fa-thumbtack" }
    ]
  },
  {
    category: "Management",
    links: [
      { 
        id: "teaching_group", label: "Teaching Hub", icon: "fa-solid fa-graduation-cap", 
        children: [
          { id: "materials", label: "My Courses", icon: "fa-brands fa-google-drive" },
          { id: "timetable", label: "Class Schedule", icon: "fa-solid fa-calendar-days" },
          { id: "attendance", label: "Attendance & Roster", icon: "fa-solid fa-clipboard-user" }
        ] 
      }
    ]
  },
  {
    category: "Advising & Committees",
    links: [
      { id: "mentorship", label: "Mentorship Hub", icon: "fa-solid fa-people-arrows" },
      { id: "clinics", label: "Clinics & Societies", icon: "fa-solid fa-scale-balanced" }
    ]
  },
  {
    category: "Administration",
    links: [
      { id: "payroll", label: "My Payroll", icon: "fa-solid fa-file-invoice-dollar" },
      { id: "facultyleave", label: "My Leaves", icon: "fa-solid fa-mug-hot" }
    ]
  }
];

const BOTTOM_NAV_LINKS = [
  { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
  { id: "materials", label: "Courses", icon: "fa-solid fa-book-open" },
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
