/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React from "react";
import SidebarFramework from "../../shared/Navigation/SidebarFramework";
import { useERP } from "../../../context/ErpContext";

export const ADMIN_NAV_GROUPS = [
  {
    category: "Master Engine",
    links: [
      { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-server" },
      { 
        id: "hq_group", label: "Headquarters", icon: "fa-solid fa-building-shield",
        children: [
          { id: "adminapprovals", label: "Central Approvals", icon: "fa-solid fa-shield-halved" },
          { id: "leavemanagement", label: "Faculty Leaves", icon: "fa-solid fa-mug-hot" },
          { id: "sql", label: "SQL Studio", icon: "fa-solid fa-terminal" },
          { id: "users", label: "User Management", icon: "fa-solid fa-users-gear" },
          { id: "notices", label: "Broadcasts", icon: "fa-solid fa-bullhorn" }
        ]
      }
    ]
  },
  {
    category: "Portals",
    links: [
      {
        id: "academics_group", label: "Academics", icon: "fa-solid fa-graduation-cap",
        children: [
          { id: "academic", label: "Overview Hub", icon: "fa-solid fa-chart-pie" },
          { id: "coursebuilder", label: "Course Builder", icon: "fa-solid fa-book-open" },
          { id: "timetablebuilder", label: "Timetable Engine", icon: "fa-solid fa-calendar-days" },
          { id: "examinations", label: "Examinations", icon: "fa-solid fa-file-contract" },
          { id: "allocations", label: "Mentorship", icon: "fa-solid fa-people-arrows" }
        ]
      },
      {
        id: "operations_group", label: "Operations", icon: "fa-solid fa-gears",
        children: [
          { id: "operations", label: "Overview Hub", icon: "fa-solid fa-chart-line" },
          { id: "adminadmissions", label: "Admissions", icon: "fa-solid fa-id-card-clip" },
          { id: "finance", label: "Finance Ledger", icon: "fa-solid fa-indian-rupee-sign" }
        ]
      },
      {
        id: "clinics_it_group", label: "Clinics & Web", icon: "fa-solid fa-globe",
        children: [
          { id: "clinics", label: "Clinics Hub", icon: "fa-solid fa-scale-balanced" },
          { id: "mootcourt", label: "Moot Court", icon: "fa-solid fa-gavel" },
          { id: "placements", label: "Placements", icon: "fa-solid fa-briefcase" },
          { id: "legalaid", label: "Legal Aid", icon: "fa-solid fa-hand-holding-hand" },
          { id: "website", label: "Website Hub", icon: "fa-solid fa-sitemap" },
          { id: "siteeditor", label: "CMS Editor", icon: "fa-solid fa-pen-nib" },
          { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-laptop-medical" }
        ]
      }
    ]
  }
];

const BOTTOM_NAV_LINKS = [
  { id: "dashboard", label: "Home", icon: "fa-solid fa-server" },
  { id: "sql", label: "Database", icon: "fa-solid fa-database" },
  { id: "website", label: "Website", icon: "fa-solid fa-globe" },
  { id: "academic", label: "Academic", icon: "fa-solid fa-graduation-cap" }
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
