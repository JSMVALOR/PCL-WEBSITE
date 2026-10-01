const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminAcademicHub/AdminCampusTimings.jsx', 'utf8');

// Add timing update handler
const handlerStr = `
  const handleUpdateTime = async (id, field, value) => {
    try {
      const { error } = await supabase.from('campus_timings').update({ [field]: value }).eq('id', id);
      if (error) throw error;
      if (window.erpToast) window.erpToast.show('Timing updated successfully.', 'success');
      fetchTimings();
    } catch (e) {
      if (window.erpToast) window.erpToast.show("Failed to update timing.", "error");
    }
  };

  const handleToggleDay = async (id, currentStatus) => {`;
file = file.replace("const handleToggleDay = async (id, currentStatus) => {", handlerStr);

// Update UI
const uiStr = `<div className="flex justify-between items-center">
                <span className={\`font-black \${day.is_active ? 'text-themeAccent' : 'text-themeTextSec'}\`}>{day.name}</span>
                <button onClick={() => handleToggleDay(day.id, day.is_active)} className={\`w-10 h-6 rounded-full relative transition-colors \${day.is_active ? 'bg-themeAccent' : 'bg-black/20 '}\`}>
                  <div className={\`w-4 h-4 bg-themePanel rounded-full absolute top-1 transition-all \${day.is_active ? 'left-5' : 'left-1'}\`}></div>
                </button>
              </div>
              
              {day.is_active && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-themeBorder/50">
                  <input 
                    type="time" 
                    value={day.start_time || ''} 
                    onChange={(e) => handleUpdateTime(day.id, 'start_time', e.target.value)}
                    className="flex-1 bg-themeApp/50 border border-themeBorder rounded-lg px-2 py-1.5 text-xs font-bold text-themeText outline-none" 
                  />
                  <span className="text-themeTextSec text-[10px] font-bold">to</span>
                  <input 
                    type="time" 
                    value={day.end_time || ''} 
                    onChange={(e) => handleUpdateTime(day.id, 'end_time', e.target.value)}
                    className="flex-1 bg-themeApp/50 border border-themeBorder rounded-lg px-2 py-1.5 text-xs font-bold text-themeText outline-none" 
                  />
                </div>
              )}`;

file = file.replace(/<div className="flex justify-between items-center">[\s\S]*?<\/div>[\s]*<\/button>[\s]*<\/div>/m, uiStr);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminAcademicHub/AdminCampusTimings.jsx', file);
