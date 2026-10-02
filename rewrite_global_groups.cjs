const fs = require('fs');
let path = 'Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the global groups mapping section
const target = `                          {/* Global Broadcast Groups */}
                          <div className="bg-themeElevated/30 border border-themeBorder rounded-2xl p-6">
                            <h4 className="font-bold text-themeText flex items-center gap-2 mb-4">
                              <i className="fa-solid fa-globe text-amber-500"></i> Global Broadcast Groups
                            </h4>
                            <p className="text-xs text-themeTextSec mb-4">Select the groups that should receive ALL general announcements and holiday notices.</p>
                            
                            <div className="flex flex-wrap gap-2">
                               {groups.map(g => {
                                 const isSelected = globalGroups.includes(g.id);
                                 return (
                                   <div 
                                     key={g.id} 
                                     onClick={() => {
                                       if (isSelected) setGlobalGroups(prev => prev.filter(id => id !== g.id));
                                       else setGlobalGroups(prev => [...prev, g.id]);
                                     }}
                                     className={\`cursor-pointer px-4 py-2 rounded-xl border text-sm font-bold transition-all \${isSelected ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-themeApp border-themeBorder text-themeTextSec hover:border-themeTextSec'}\`}
                                   >
                                     <i className={\`fa-solid \${isSelected ? 'fa-check' : 'fa-plus'} mr-2\`}></i>
                                     {g.name}
                                   </div>
                                 );
                               })}
                            </div>
                          </div>`;

const replacement = `                          {/* Global Broadcast Groups */}
                          <div className="bg-themeElevated/30 border border-themeBorder rounded-2xl p-6">
                            <h4 className="font-bold text-themeText flex items-center gap-2 mb-2">
                              <i className="fa-solid fa-globe text-amber-500"></i> Global Broadcast Groups
                            </h4>
                            <p className="text-xs text-themeTextSec mb-6">These groups will receive ALL general announcements and holiday notices.</p>
                            
                            <div className="flex flex-col gap-4">
                              {/* Selected Groups as Cards */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                {globalGroups.length === 0 && (
                                  <div className="col-span-full text-center py-6 border border-dashed border-themeBorder rounded-xl text-themeTextSec text-sm font-bold">
                                    No global broadcast groups added yet.
                                  </div>
                                )}
                                {globalGroups.map(id => {
                                  const groupObj = groups.find(g => g.id === id);
                                  return (
                                    <div key={id} className="bg-themeApp border border-amber-500/30 rounded-xl p-4 flex items-start justify-between group shadow-sm hover:border-amber-500 transition-colors">
                                      <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                                          <i className="fa-solid fa-users"></i>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-themeText text-sm line-clamp-1" title={groupObj?.name || 'Unknown Group'}>{groupObj?.name || 'Unknown Group'}</h5>
                                          <span className="text-[10px] uppercase tracking-widest text-themeTextSec font-bold">{groupObj?.participants || '?'} members</span>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => setGlobalGroups(prev => prev.filter(gid => gid !== id))}
                                        className="text-themeTextSec hover:text-rose-500 hover:bg-rose-500/10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0"
                                      >
                                        <i className="fa-solid fa-xmark"></i>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Add Group Dropdown */}
                              <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-4 border-t border-themeBorder">
                                <select 
                                  id="newGlobalGroupSelect"
                                  className="flex-1 bg-themeApp border border-themeBorder rounded-xl p-3 text-sm font-bold text-themeText outline-none focus:border-amber-500"
                                >
                                  <option value="">Select a group to add...</option>
                                  {groups.filter(g => !globalGroups.includes(g.id)).map(g => (
                                    <option key={g.id} value={g.id}>{g.name} ({g.participants} members)</option>
                                  ))}
                                </select>
                                <button 
                                  onClick={() => {
                                    const selectEl = document.getElementById('newGlobalGroupSelect');
                                    if (selectEl && selectEl.value) {
                                      setGlobalGroups(prev => [...prev, selectEl.value]);
                                      selectEl.value = "";
                                    }
                                  }}
                                  className="bg-amber-500 text-themeApp px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-amber-600 transition-colors whitespace-nowrap"
                                >
                                  <i className="fa-solid fa-plus mr-2"></i> Add Group
                                </button>
                              </div>
                            </div>
                          </div>`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
console.log('Rewrote Global Broadcast Groups UI to use Cards and an Add dropdown');
