import re

with open('src/ERP/components/Student/Leave/Leave.jsx', 'r') as f:
    content = f.read()

# 1. Inject InlineCalendar component right after imports
inline_calendar = """
// ═══════════════════════════════════════════════════════════════
// INLINE CALENDAR
// ═══════════════════════════════════════════════════════════════
const InlineCalendar = ({ value, onChange, minDate, maxDate, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currDate, setCurrDate] = useState(value ? new Date(value) : new Date());
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const year = currDate.getFullYear();
    const month = currDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const days = Array(firstDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    const handleSelect = (date) => {
        onChange(new Date(date - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white hover:border-amber-500 cursor-pointer transition flex items-center justify-between"
            >
                {value ? new Date(value).toLocaleDateString('en-GB') : placeholder}
                <i className="fa-solid fa-calendar text-themeTextSec dark:text-white/30 pointer-events-none"></i>
            </div>
            {isOpen && (
                <div className="absolute z-[100] top-full mt-2 left-0 w-full bg-white dark:bg-themePanel border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={() => setCurrDate(new Date(year, month - 1, 1))} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 transition-colors text-themeText dark:text-white">
                            <i className="fa-solid fa-chevron-left text-xs"></i>
                        </button>
                        <span className="text-sm font-bold text-themeText dark:text-white tracking-tight">
                            {currDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button type="button" onClick={() => setCurrDate(new Date(year, month + 1, 1))} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 transition-colors text-themeText dark:text-white">
                            <i className="fa-solid fa-chevron-right text-xs"></i>
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                            <div key={d} className="text-[10px] font-bold text-themeTextSec dark:text-white/40 text-center">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((date, i) => {
                            if (!date) return <div key={i} className="aspect-square"></div>;
                            const isSelected = value && new Date(value).getDate() === date.getDate() && new Date(value).getMonth() === date.getMonth();
                            const isPast = minDate && date < new Date(minDate);
                            const isFuture = maxDate && date > new Date(maxDate);
                            const disabled = isPast || isFuture;
                            
                            return (
                                <button 
                                    key={i} 
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleSelect(date)}
                                    className={`aspect-square flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                                        isSelected 
                                        ? 'bg-amber-500 text-black shadow-md scale-105 z-10' 
                                        : disabled 
                                            ? 'text-themeTextSec dark:text-white/20 opacity-50 cursor-not-allowed'
                                            : 'text-themeText dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
"""

content = content.replace("export default function Leave({ isEmbedded = false, }) {", inline_calendar + "\nexport default function Leave({ isEmbedded = false, }) {")

# 2. Replace the HTML native date inputs
old_grid = """<div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">From Date</label>
 <input min="2026-09-14" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition [color-scheme:dark]" required />
 </div>
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">To Date</label>
 <input min="2026-09-14" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition [color-scheme:dark]" required />
 </div>
 </div>"""

new_grid = """<div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">From Date</label>
 <InlineCalendar value={fromDate} onChange={(d) => { setFromDate(d); if(toDate && new Date(d) > new Date(toDate)) setToDate(d); }} minDate={new Date(new Date().setDate(new Date().getDate() - 7))} placeholder="dd/mm/yyyy" />
 </div>
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">To Date</label>
 <InlineCalendar value={toDate} onChange={setToDate} minDate={fromDate || new Date()} placeholder="dd/mm/yyyy" />
 </div>
 </div>"""

content = content.replace(old_grid, new_grid)

# 3. Add toDate auto-correction in the form submit if needed
submit_old = """      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (start > end) {
        throw new Error("End date cannot be before start date.");
      }"""

submit_new = """      if (!fromDate || !toDate) {
        throw new Error("Please select both dates.");
      }
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (start > end) {
        throw new Error("End date cannot be before start date.");
      }"""
content = content.replace(submit_old, submit_new)

with open('src/ERP/components/Student/Leave/Leave.jsx', 'w') as f:
    f.write(content)

