const fs = require('fs');
let p = 'src/ERP/components/Student/Timetable/Timetable.jsx';
let c = fs.readFileSync(p, 'utf8');

// Update the tab array
c = c.replace(
    "{['Today', 'Week', 'Calendar', 'Changes'].map(tab => (",
    "{['Today', 'Week'].map(tab => ("
);

// Remove the calendar and changes render blocks
const renderBlocks = `{activeTab === 'calendar' && renderCalendar()}
                                {activeTab === 'changes' && (
                                    <div className="w-full py-20 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4">
                                        <i className="fa-solid fa-code-compare text-4xl mb-4 text-gray-500 dark:text-white/50"></i>
                                        <p className="text-sm font-bold text-gray-500 dark:text-white/50">No recent timetable changes.</p>
                                    </div>
                                )}`;

c = c.replace(renderBlocks, "");

fs.writeFileSync(p, c);
console.log("Removed Calendar and Changes tabs from Timetable");
