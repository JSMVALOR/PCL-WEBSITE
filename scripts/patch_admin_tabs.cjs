const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/LeaveManagement/AdminLeaveManagement.jsx';
let content = fs.readFileSync(file, 'utf8');

const imports = `import LeaveDashboard from "./LeaveDashboard";
import LeaveRequests from "./LeaveRequests";
import LeaveCalendar from "./LeaveCalendar";
import LeaveReview from "./LeaveReview"; // Detailed view of a request
import ReplacementEngine from "./ReplacementEngine";
import LeavePolicies from "./LeavePolicies";
import LeaveAnalytics from "./LeaveAnalytics";`;

content = content.replace(/import LeaveDashboard from "\.\/LeaveDashboard";[\s\S]*?import ReplacementEngine from "\.\/ReplacementEngine";/, imports);

const oldTabs = ` const tabs = [
 { id: "dashboard", label: "Overview", icon: "fa-chart-pie" },
 { id: "requests", label: "Leave Requests", icon: "fa-inbox" },
 { id: "calendar", label: "Calendar", icon: "fa-calendar-days" },
 
 ];`;

const newTabs = ` const tabs = [
 { id: "dashboard", label: "Dashboard", icon: "fa-chart-pie" },
 { id: "requests", label: "Leave Requests", icon: "fa-inbox" },
 { id: "calendar", label: "Calendar", icon: "fa-calendar-days" },
 { id: "analytics", label: "Analytics", icon: "fa-chart-line" },
 { id: "policies", label: "Policies", icon: "fa-scale-balanced" },
 { id: "audit", label: "Audit Log", icon: "fa-clipboard-list" }
 ];`;

content = content.replace(oldTabs, newTabs);

const oldRender = ` {activeTab === "dashboard" && <LeaveDashboard setActiveTab={setActiveTab} />}
 {activeTab === "requests" && <LeaveRequests onReviewRequest={handleReviewRequest} />}
 {activeTab === "calendar" && <LeaveCalendar />}
 
            {activeTab === "review" && selectedRequest && (`;

const newRender = ` {activeTab === "dashboard" && <LeaveDashboard setActiveTab={setActiveTab} />}
 {activeTab === "requests" && <LeaveRequests onReviewRequest={handleReviewRequest} />}
 {activeTab === "calendar" && <LeaveCalendar />}
 {activeTab === "analytics" && <LeaveAnalytics />}
 {activeTab === "policies" && <LeavePolicies />}
 {activeTab === "audit" && <div className="p-12 text-center text-themeTextSec italic">Audit Log coming soon...</div>}
 
            {activeTab === "review" && selectedRequest && (`;

content = content.replace(oldRender, newRender);

fs.writeFileSync(file, content);
