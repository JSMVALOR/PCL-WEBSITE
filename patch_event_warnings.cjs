const fs = require('fs');

const extractEvents = (content) => {
    return content.replace(
        /const \{ userSession \} = useERP\(\);/,
        'const { userSession, events = [] } = useERP();'
    );
};

const warningLogic = `
 // EVENT CONFLICT CHECKER
 const getEventConflicts = () => {
 if (!fromDate || !events || !events.length) return [];
 const start = new Date(fromDate);
 const end = toDate ? new Date(toDate) : start;
 start.setHours(0,0,0,0);
 end.setHours(23,59,59,999);
 
 return events.filter(ev => {
 const evDate = new Date(ev.event_date);
 return evDate >= start && evDate <= end;
 });
 };
 const conflictingEvents = getEventConflicts();
`;

const warningBanner = `
 {conflictingEvents.length > 0 && (
 <div className="p-4 rounded-xl text-xs font-bold uppercase tracking-widest flex flex-col gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500">
 <div className="flex items-center gap-2">
 <i className="fa-solid fa-triangle-exclamation"></i>
 <span>WARNING: LEAVE BLOCKED DURING COLLEGE EVENTS</span>
 </div>
 <span className="text-[9px] text-amber-500/80 normal-case tracking-normal">
 You are applying for leave during <strong>{conflictingEvents.map(e => e.title).join(', ')}</strong>. Leaves during events are strictly blocked and will only be approved in urgent emergencies.
 </span>
 </div>
 )}
`;

// Patch FacultyLeave.jsx
let facFile = 'Frontend/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx';
let facContent = fs.readFileSync(facFile, 'utf8');
facContent = extractEvents(facContent);

// Inject warningLogic before 'return (' inside the component
// actually, let's inject it right before 'const handleRequestSubmit'
facContent = facContent.replace(
    /const handleRequestSubmit = async \(e\) => \{/,
    warningLogic + '\n    const handleRequestSubmit = async (e) => {'
);

// Inject warningBanner inside the form, below statusMessage
facContent = facContent.replace(
    /(<form onSubmit=\{handleRequestSubmit\}[^>]*>\s*(?:\{statusMessage\.text && \([\s\S]*?\)\}\s*)?)/,
    '$1' + warningBanner
);

fs.writeFileSync(facFile, facContent);


// Patch Leave.jsx (Student)
let stuFile = 'Frontend/ERP/components/Student/Leave/Leave.jsx';
let stuContent = fs.readFileSync(stuFile, 'utf8');
stuContent = extractEvents(stuContent);

stuContent = stuContent.replace(
    /const handleRequestSubmit = async \(e\) => \{/,
    warningLogic + '\n    const handleRequestSubmit = async (e) => {'
);

stuContent = stuContent.replace(
    /(<form onSubmit=\{handleRequestSubmit\}[^>]*>\s*(?:\{statusMessage\.text && \([\s\S]*?\)\}\s*)?)/,
    '$1' + warningBanner
);

fs.writeFileSync(stuFile, stuContent);
