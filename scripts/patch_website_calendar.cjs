const fs = require('fs');
let file = fs.readFileSync('Frontend/Website/components/NAVBAR/PROGRAMS/Programs.jsx', 'utf8');

// Replace fetchEvents logic
file = file.replace(
    /const fetchEvents = async \(\) => \{[\s\S]*?\}\;\s*fetchEvents\(\)\;\s*\}, \[\]\);/,
    `const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'academic_calendar_grid')
          .single();
        
        if (error) throw error;
        setCalendarEvents(data?.value || null);
      } catch (err) {
        console.error("Error fetching academic calendar grid:", err);
      } finally {
        setCalendarLoading(false);
      }
    };
    fetchEvents();
  }, []);`
);

// Replace the render logic for the calendar tab
const oldRender = /{activeTab === 'calendar' && \([\s\S]*?\{activeTab === 'collaborations'/;
const newRender = `{activeTab === 'calendar' && (
                <div className="py-20 w-full max-w-5xl mx-auto">
                  <div className="relative w-full mx-auto mb-16">
                    {calendarLoading ? (
                      <div className="flex justify-center py-12">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
                      </div>
                    ) : calendarEvents && calendarEvents.rows && calendarEvents.rows.length > 0 ? (
                      <div className="overflow-x-auto rounded-3xl border border-[var(--card-border)] shadow-2xl bg-[var(--bg-color)]/60 backdrop-blur-3xl">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="border-b border-[var(--card-border)] bg-[var(--card-bg)]">
                              <th className="p-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest w-12 text-center">S.No</th>
                              {calendarEvents.columns.map(col => (
                                <th key={col} className="p-5 text-xs font-bold text-[var(--text-color)] uppercase tracking-widest min-w-[150px]">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--card-border)]">
                            {calendarEvents.rows.map((row, idx) => (
                              <tr key={row.id} className="hover:bg-[var(--card-bg)] transition-colors">
                                <td className="p-5 text-center text-[10px] font-black text-[var(--text-muted)]">{idx + 1}</td>
                                {calendarEvents.columns.map(col => (
                                  <td key={col} className="p-5 text-sm font-medium text-[var(--text-color)]">
                                    {row.data[col] || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 glassCard p-12 max-w-md mx-auto">
                          <p className="text-[var(--text-muted)] italic text-lg">No academic calendar grid published yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'collaborations'`;

file = file.replace(oldRender, newRender);

fs.writeFileSync('Frontend/Website/components/NAVBAR/PROGRAMS/Programs.jsx', file);
