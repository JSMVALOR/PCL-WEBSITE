const fs = require('fs');

const files = [
    'Frontend/Website/components/NAVBAR/PROGRAMS/CourseBBALLB.jsx',
    'Frontend/Website/components/NAVBAR/PROGRAMS/CourseLLB.jsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    const search = `{/* Quick Facts Sidebar */}
          <div className="order-first md:order-last mb-8 md:mb-0 relative h-full">
            <div className={\`\${styles.glassCard} sticky top-[100px] gsap-fade-up\`}>`;

    const replace = `{/* Quick Facts Sidebar */}
          <div className="order-first md:order-last mb-8 md:mb-0 relative">
            <div className="sticky top-[100px]">
              <div className={\`\${styles.glassCard} gsap-fade-up\`}>`;

    if (content.includes(search)) {
        content = content.replace(search, replace);
        
        const searchClose = `                </Link>
              </div>
            </div>
          </div>
        </div>`;
            
        const replaceClose = `                </Link>
              </div>
            </div>
            </div>
          </div>
        </div>`;
        
        content = content.replace(searchClose, replaceClose);
        fs.writeFileSync(file, content);
        console.log("Patched " + file + " successfully.");
    } else {
        console.log("Could not find target block in " + file);
    }
});
