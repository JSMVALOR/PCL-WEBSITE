const fs = require('fs');
const path = 'Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('createPortal')) {
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';");
}

const oldBlockStart = '{viewingSubmission && (';
const oldBlockEndStr = `                </div>
            </div>
        )}`;

const newBlockStart = '{viewingSubmission && createPortal(';
const newBlockEndStr = `                </div>
            </div>
        </div>
    </div>, document.body
)}`;

// Replace start
content = content.replace(
    '{viewingSubmission && (\n <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-8 animate-fade-in">\n <div className="bg-themeApp w-full max-w-4xl h-full max-h-[85vh] rounded-[2rem] border border-themeBorder shadow-2xl flex flex-col overflow-hidden animate-slide-up">',
    '{viewingSubmission && createPortal(\n <div className="fixed inset-0 z-[200] bg-themeApp animate-fade-in flex flex-col overflow-y-auto">\n <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col bg-themeApp shadow-none border-none rounded-none">'
);

// Replace end
content = content.replace(
    ' </div>\n </div>\n )}',
    ' </div>\n </div>\n </div>\n </div>, document.body\n )}'
);

fs.writeFileSync(path, content);
console.log('Patched viewingSubmission to createPortal');
