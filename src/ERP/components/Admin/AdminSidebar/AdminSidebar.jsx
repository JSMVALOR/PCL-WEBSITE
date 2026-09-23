/* © 2026 JSM VALOR. All Rights Reserved. */
import React from "react";
import SidebarFramework from "../../shared/Navigation/SidebarFramework";
import { useERP } from "../../../context/ErpContext";

export const ADMIN_NAV_GROUPS = [
  {
    category: "Command Center",
    links: [
      { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-server" },
      { id: "adminapprovals", label: "Central Approvals", icon: "fa-solid fa-shield-halved" }
    ]
  },
  {
    category: "Academics & Operations",
    links: [
      { id: "academic", label: "Academic Hub", icon: "fa-solid fa-chart-pie" },
      { id: "timetablebuilder", label: "Timetable Engine", icon: "fa-solid fa-calendar-days" },
      { id: "coursebuilder", label: "Course Builder", icon: "fa-solid fa-book-open" },
      { id: "markscontroller", label: "Marks & Ledger", icon: "fa-solid fa-file-signature" },
      { id: "attendance_issues", label: "Attendance Control", icon: "fa-solid fa-clipboard-question" },
      { id: "allocations", label: "Mentorship", icon: "fa-solid fa-people-arrows" }
    ]
  },
  {
    category: "HR & Finance",
    links: [
      { id: "users", label: "User Management", icon: "fa-solid fa-user-gear" },
      { id: "adminadmissions", label: "Admissions", icon: "fa-solid fa-id-card-clip" },
      { id: "finance", label: "Finance & Payroll", icon: "fa-solid fa-indian-rupee-sign" },
      {
        id: "staff_ops", label: "Staff Operations", icon: "fa-solid fa-users",
        children: [
          { id: "leavemanagement", label: "Leave Approvals", icon: "fa-solid fa-mug-hot" },
          { id: "faculty_attendance", label: "Faculty Tracking", icon: "fa-solid fa-user-clock" }
        ]
      }
    ]
  },
  {
    category: "Website Sync & Public",
    links: [
      { id: "siteeditor", label: "CMS Editor", icon: "fa-solid fa-pen-nib" },
      { id: "blogs", label: "Blog Engine", icon: "fa-solid fa-blog" },
      { id: "careers", label: "Careers Manager", icon: "fa-solid fa-briefcase" },
      {
        id: "clinics_group", label: "Clinical & Extracurricular", icon: "fa-solid fa-scale-balanced",
        children: [
          { id: "clinics", label: "Clinics Hub", icon: "fa-solid fa-chart-pie" },
          { id: "mootcourt", label: "Moot Court", icon: "fa-solid fa-gavel" },
          { id: "legalaid", label: "Legal Aid", icon: "fa-solid fa-hand-holding-hand" },
          { id: "placements", label: "Placements API", icon: "fa-solid fa-briefcase" }
        ]
      }
    ]
  },
  {
    category: "IT & Systems",
    links: [
      { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-laptop-medical" },
      { id: "sql", label: "SQL Studio", icon: "fa-solid fa-terminal" },
      { id: "whatsapp", label: "WhatsApp Server", icon: "fa-brands fa-whatsapp" },
      { id: "parent-preview", label: "Parent View", icon: "fa-solid fa-user-group" }
    ]
  }
];

const BOTTOM_NAV_LINKS = [
  { id: "dashboard", label: "Home", icon: "fa-solid fa-server" },
  { id: "academic", label: "Academics", icon: "fa-solid fa-graduation-cap" },
  { id: "users", label: "HR", icon: "fa-solid fa-users" },
  { id: "siteeditor", label: "Website", icon: "fa-solid fa-globe" }
];


export const ADMIN_NAV_MEGA = [
  {
    category: "Main",
    links: [
      { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-server" },
      { id: "adminapprovals", label: "Approvals", icon: "fa-solid fa-shield-halved" },
      {
        id: "academic_group", label: "Academics", icon: "fa-solid fa-graduation-cap",
        sections: [
          {
            title: "Curriculum & Scheduling",
            children: [
              { id: "academic", label: "Academic Hub", icon: "fa-solid fa-chart-pie" },
              { id: "coursebuilder", label: "Course Builder", icon: "fa-solid fa-book-open" },
              { id: "timetablebuilder", label: "Timetable Engine", icon: "fa-solid fa-calendar-days" }
            ]
          },
          {
            title: "Student Progress",
            children: [
              { id: "markscontroller", label: "Marks & Ledger", icon: "fa-solid fa-file-signature" },
              { id: "attendance_issues", label: "Attendance Control", icon: "fa-solid fa-clipboard-question" },
              { id: "allocations", label: "Mentorship", icon: "fa-solid fa-people-arrows" }
            ]
          }
        ],
        children: [
          { id: "academic", label: "Academic Hub", icon: "fa-solid fa-chart-pie" },
          { id: "timetablebuilder", label: "Timetable Engine", icon: "fa-solid fa-calendar-days" },
          { id: "coursebuilder", label: "Course Builder", icon: "fa-solid fa-book-open" },
          { id: "markscontroller", label: "Marks & Ledger", icon: "fa-solid fa-file-signature" },
          { id: "attendance_issues", label: "Attendance Control", icon: "fa-solid fa-clipboard-question" },
          { id: "allocations", label: "Mentorship", icon: "fa-solid fa-people-arrows" }
        ]
      },
      {
        id: "hr_group", label: "HR & Finance", icon: "fa-solid fa-users",
        sections: [
          {
            title: "Human Resources",
            children: [
              { id: "users", label: "User Management", icon: "fa-solid fa-user-gear" },
              { id: "faculty_attendance", label: "Faculty Tracking", icon: "fa-solid fa-user-clock" },
              { id: "leavemanagement", label: "Leave Approvals", icon: "fa-solid fa-mug-hot" }
            ]
          },
          {
            title: "Operations & Finance",
            children: [
              { id: "adminadmissions", label: "Admissions", icon: "fa-solid fa-id-card-clip" },
              { id: "finance", label: "Finance & Payroll", icon: "fa-solid fa-indian-rupee-sign" }
            ]
          }
        ],
        children: [
          { id: "users", label: "User Management", icon: "fa-solid fa-user-gear" },
          { id: "adminadmissions", label: "Admissions", icon: "fa-solid fa-id-card-clip" },
          { id: "finance", label: "Finance & Payroll", icon: "fa-solid fa-indian-rupee-sign" },
          { id: "leavemanagement", label: "Leave Approvals", icon: "fa-solid fa-mug-hot" },
          { id: "faculty_attendance", label: "Faculty Tracking", icon: "fa-solid fa-user-clock" }
        ]
      },
      {
        id: "clinics_group", label: "Clinics & Programs", icon: "fa-solid fa-scale-balanced",
        sections: [
          {
            title: "Student Programs",
            children: [
              { id: "clinics", label: "Clinics Hub", icon: "fa-solid fa-chart-pie" },
              { id: "mootcourt", label: "Moot Court", icon: "fa-solid fa-gavel" },
              { id: "legalaid", label: "Legal Aid", icon: "fa-solid fa-hand-holding-hand" }
            ]
          }
        ],
        children: [
          { id: "clinics", label: "Clinics Hub", icon: "fa-solid fa-chart-pie" },
          { id: "mootcourt", label: "Moot Court", icon: "fa-solid fa-gavel" },
          { id: "legalaid", label: "Legal Aid", icon: "fa-solid fa-hand-holding-hand" }
        ]
      },
      {
        id: "website_group", label: "Website Sync", icon: "fa-solid fa-globe",
        sections: [
          {
            title: "Core Content",
            children: [
              { id: "siteeditor", label: "CMS Editor", icon: "fa-solid fa-pen-nib" },
              { id: "blogs", label: "Blog Engine", icon: "fa-solid fa-blog" },
              { id: "gallery", label: "Gallery Manager", icon: "fa-regular fa-images" }
            ]
          },
          {
            title: "External Relations",
            children: [
              { id: "careers", label: "Careers Manager", icon: "fa-solid fa-briefcase" },
              { id: "placements", label: "Placements API", icon: "fa-solid fa-briefcase" },
              { id: "enquiries", label: "Website Enquiries", icon: "fa-solid fa-envelope-open-text" }
            ]
          }
        ],
        children: [
          { id: "siteeditor", label: "CMS Editor", icon: "fa-solid fa-pen-nib" },
          { id: "blogs", label: "Blog Engine", icon: "fa-solid fa-blog" },
          { id: "gallery", label: "Gallery Manager", icon: "fa-regular fa-images" },
          { id: "careers", label: "Careers Manager", icon: "fa-solid fa-briefcase" },
          { id: "placements", label: "Placements API", icon: "fa-solid fa-briefcase" },
          { id: "enquiries", label: "Website Enquiries", icon: "fa-solid fa-envelope-open-text" }
        ]
      },
      {
        id: "comms_group", label: "Communications", icon: "fa-solid fa-tower-broadcast",
        children: [
          { id: "notices", label: "System Broadcasts", icon: "fa-solid fa-bullhorn" },
          { id: "whatsapp", label: "WhatsApp Server", icon: "fa-brands fa-whatsapp" }
        ]
      },
      {
        id: "it_group", label: "IT & Systems", icon: "fa-solid fa-gears",
        children: [
          { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-laptop-medical" },
          { id: "sql", label: "SQL Studio", icon: "fa-solid fa-terminal" },
          { id: "parent-preview", label: "Parent View", icon: "fa-solid fa-user-group" }
        ]
      }
    ]
  }
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
