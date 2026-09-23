/* © 2026 JSM VALOR. All Rights Reserved. */
import React from "react";
import SidebarFramework from "../../shared/Navigation/SidebarFramework";
import { useERP } from "../../../context/ErpContext";

export const ADMIN_NAV_GROUPS = [
  {
    category: "Main",
    links: [
      { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-server" },
      { id: "notices", label: "Broadcasts", icon: "fa-solid fa-bullhorn" }
    ]
  },
  {
    category: "Administration",
    links: [
      { id: "adminapprovals", label: "Central Approvals", icon: "fa-solid fa-shield-halved" },
      {
        id: "users_group", label: "People & HR", icon: "fa-solid fa-users",
        children: [
          { id: "users", label: "User Management", icon: "fa-solid fa-user-gear" },
          { id: "adminadmissions", label: "Admissions", icon: "fa-solid fa-id-card-clip" },
          { id: "leavemanagement", label: "Leave Management", icon: "fa-solid fa-mug-hot" },
          { id: "faculty_attendance", label: "Faculty Attendance", icon: "fa-solid fa-user-clock" }
        ]
      },
      { id: "finance", label: "Finance & Ledger", icon: "fa-solid fa-indian-rupee-sign" }
    ]
  },
  {
    category: "Academics",
    links: [
      {
        id: "academic_group", label: "Academic Control", icon: "fa-solid fa-graduation-cap",
        children: [
          { id: "academic", label: "Academic Hub", icon: "fa-solid fa-chart-pie" },
          { id: "attendance_issues", label: "Attendance Issues", icon: "fa-solid fa-clipboard-question" },
          { id: "coursebuilder", label: "Course Builder", icon: "fa-solid fa-book-open" },
          { id: "markscontroller", label: "Marks Dispatcher", icon: "fa-solid fa-file-signature" },
          { id: "timetablebuilder", label: "Timetable Engine", icon: "fa-solid fa-calendar-days" },
          { id: "allocations", label: "Mentorship", icon: "fa-solid fa-people-arrows" }
        ]
      },
      {
        id: "clinics_group", label: "Clinical Programs", icon: "fa-solid fa-scale-balanced",
        children: [
          { id: "clinics", label: "Clinics Hub", icon: "fa-solid fa-chart-pie" },
          { id: "mootcourt", label: "Moot Court", icon: "fa-solid fa-gavel" },
          { id: "legalaid", label: "Legal Aid", icon: "fa-solid fa-hand-holding-hand" },
          { id: "placements", label: "Placements", icon: "fa-solid fa-briefcase" }
        ]
      }
    ]
  },
  {
    category: "IT & Systems",
    links: [
      {
        id: "web_group", label: "Website Control", icon: "fa-solid fa-globe",
        children: [
          { id: "siteeditor", label: "CMS Editor", icon: "fa-solid fa-pen-nib" },
          { id: "blogs", label: "Blog Engine", icon: "fa-solid fa-blog" },
          { id: "careers", label: "Careers Manager", icon: "fa-solid fa-briefcase" }
        ]
      },
      {
        id: "sys_group", label: "System Config", icon: "fa-solid fa-gears",
        children: [
          { id: "sql", label: "SQL Studio", icon: "fa-solid fa-terminal" },
          { id: "whatsapp", label: "WhatsApp API", icon: "fa-brands fa-whatsapp" },
          { id: "parent-preview", label: "Parent Portal", icon: "fa-solid fa-user-group" },
          { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-laptop-medical" }
        ]
      }
    ]
  }
];

const BOTTOM_NAV_LINKS = [
  { id: "dashboard", label: "Home", icon: "fa-solid fa-server" },
  { id: "users", label: "Users", icon: "fa-solid fa-users" },
  { id: "finance", label: "Finance", icon: "fa-solid fa-indian-rupee-sign" },
  { id: "siteeditor", label: "Website", icon: "fa-solid fa-globe" }
];

export const ADMIN_NAV_EXPANDED = ADMIN_NAV_GROUPS;

export default function AdminSidebar({ userSession, activeTab, setActiveTab, onLogout }) {
  const { sidebarMode } = useERP();
  
  const currentConfig = sidebarMode === 'expanded' ? ADMIN_NAV_EXPANDED : ADMIN_NAV_GROUPS;

  return (
    <SidebarFramework 
      config={currentConfig}
      bottomLinks={BOTTOM_NAV_LINKS}
      userSession={userSession}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={onLogout}
      customBrandContext="Admin"
    />
  );
}
