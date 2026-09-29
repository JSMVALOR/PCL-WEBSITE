const fs = require('fs');
const file = 'Frontend/ERP/components/shared/DashboardWidgets/DashboardGreetingBanner.jsx';
let content = fs.readFileSync(file, 'utf8');

// We will replace the entire return block to use PageHeader style.
const newReturn = `    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={\`flex flex-col md:flex-row md:items-center justify-between gap-6 bg-themePanel/85 backdrop-blur-2xl border border-themeBorder shadow-premium rounded-themePanel p-4 md:p-6 lg:p-8 w-full z-10\`}
        >
            <div className="flex items-center gap-5 w-full">
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeAccent/10 border border-themeAccent/20 rounded-xl flex items-center justify-center text-themeAccent text-2xl lg:text-3xl shrink-0 shadow-sm backdrop-blur-xl">
                    <i className={\`fa-solid \${icon}\`}></i>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                    <h1 className="text-[22px] lg:text-[28px] font-bold text-themeText mb-0.5 tracking-tight leading-tight flex items-center gap-2 flex-wrap">
                        {greeting}, <span className="text-themeAccent truncate">{userName}</span>
                    </h1>
                    <p className="text-themeTextSec text-[13px] lg:text-[14px] font-medium tracking-tight truncate">
                        {subtitle}
                    </p>
                </div>
            </div>
        </motion.div>
    );`;

content = content.replace(/return \([\s\S]*?\);\n\}/, newReturn + '\n}');

fs.writeFileSync(file, content);
console.log('DashboardGreetingBanner updated');
