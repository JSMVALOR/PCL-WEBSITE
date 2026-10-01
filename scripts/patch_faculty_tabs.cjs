const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/ABOUT/FacultyProfile.jsx';
let content = fs.readFileSync(file, 'utf8');

// First, add the activeTab state to the component
content = content.replace(
  'const [faculty, setFaculty] = useState(null);',
  'const [faculty, setFaculty] = useState(null);\n  const [activeTab, setActiveTab] = useState(null);\n\n  useEffect(() => {\n    if (availableTabs.length > 0 && !activeTab) {\n      setActiveTab(availableTabs[0].id);\n    }\n  }, [availableTabs, activeTab]);'
);

// Second, replace the space-y-20 stacked sections with a Tabs UI
const oldSections = `          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5 }}
            className="flex flex-col space-y-20"
          >
            {availableTabs.map((section, index) => {
              const content = faculty[section.id];
              if (!content || (typeof content === 'string' && content.trim().length === 0) || (Array.isArray(content) && content.length === 0)) return null;

              return (
                <div key={section.id} className="w-full">
                  <h3 className="text-3xl font-serif mb-8 text-[var(--text-color)] tracking-tight">{section.label}</h3>
                  <div className="w-full">
                    {renderList(content)}
                  </div>
                </div>
              );
            })}
          </motion.div>`;

const newSections = `          {availableTabs.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.5 }}
              className="w-full mt-4"
            >
              {/* Tabs Header */}
              <div className="flex flex-wrap gap-2 md:gap-4 mb-8 md:mb-12 border-b border-[var(--card-border)]/60 pb-4">
                {availableTabs.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={\`pb-2 px-1 text-sm md:text-base font-bold uppercase tracking-wider transition-all relative whitespace-nowrap \${
                      activeTab === section.id 
                        ? 'text-[var(--primary-color)]' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                    }\`}
                  >
                    {section.label}
                    {activeTab === section.id && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute bottom-[-16px] left-0 w-full h-[3px] bg-[var(--primary-color)]"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {availableTabs.map((section) => {
                  if (section.id !== activeTab) return null;
                  const content = faculty[section.id];
                  if (!content) return null;

                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full min-h-[300px]"
                    >
                      {renderList(content)}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}`;

content = content.replace(oldSections, newSections);
fs.writeFileSync(file, content);
