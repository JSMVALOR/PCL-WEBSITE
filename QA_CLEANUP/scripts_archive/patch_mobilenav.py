import re

with open('src/ERP/components/shared/MobileNav.jsx', 'r') as f:
    content = f.read()

# Let's replace the grid layout with a clean Apple-style list layout.
old_grid = """                                    <div className="grid grid-cols-2 gap-3">
                                        {group.links.flatMap(l => l.children ? l.children : [l]).map(link => {
                                            const isActive = activeTab === link.id;
                                            const hasNotice = link.id === 'notices' && notices?.length > 0;
                                            return (
                                                <button type="button"
                                                    key={link.id}
                                                    onClick={() => handleTabSwitch(link.id)}
                                                    className={`relative flex flex-col items-start gap-3 p-4 rounded-themePanel border transition duration-300 ${isActive 
                                                        ? `bg-white dark:bg-themeElevated shadow-sm border-black/[0.04] dark:border-white/[0.08] ${accentColor}` 
                                                        : 'bg-black/5 dark:bg-white/5 backdrop-blur-md border-transparent text-themeText dark:text-themeText hover:bg-white dark:hover:bg-white/10'}`}
                                                >
                                                    <div className="flex justify-between w-full">
                                                        <i className={`${link.icon} text-xl ${isActive ? '' : 'text-themeTextSec opacity-80'}`}></i>
                                                        {hasNotice && !isActive && (
                                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] font-black tracking-normal text-left leading-snug">{link.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>"""

new_list = """                                    <div className="flex flex-col rounded-[20px] bg-white dark:bg-black/20 border border-black/[0.04] dark:border-white/[0.05] overflow-hidden">
                                        {group.links.flatMap(l => l.children ? l.children : [l]).map((link, i, arr) => {
                                            const isActive = activeTab === link.id;
                                            const hasNotice = link.id === 'notices' && notices?.length > 0;
                                            const isLast = i === arr.length - 1;
                                            return (
                                                <button type="button"
                                                    key={link.id}
                                                    onClick={() => handleTabSwitch(link.id)}
                                                    className={`relative flex items-center justify-between w-full p-4 transition-colors ${isActive ? 'bg-black/[0.03] dark:bg-white/[0.05]' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'} ${!isLast ? 'border-b border-black/[0.03] dark:border-white/[0.05]' : ''}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? `bg-white dark:bg-black/20 shadow-sm border border-black/[0.04] dark:border-white/[0.05] ${accentColor}` : 'text-themeTextSec'}`}>
                                                            <i className={`${link.icon} text-sm`}></i>
                                                        </div>
                                                        <span className={`text-[13px] font-bold tracking-tight ${isActive ? 'text-themeText dark:text-white' : 'text-themeTextSec dark:text-white/70'}`}>{link.label}</span>
                                                    </div>
                                                    {hasNotice && !isActive ? (
                                                        <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
                                                    ) : (
                                                        <i className="fa-solid fa-chevron-right text-[10px] text-themeTextSec/30"></i>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>"""

if old_grid in content:
    content = content.replace(old_grid, new_list)

with open('src/ERP/components/shared/MobileNav.jsx', 'w') as f:
    f.write(content)
