const fs = require('fs');
const file = 'Frontend/Website/components/NAVBAR/PROGRAMS/CourseBALLB.jsx';
let content = fs.readFileSync(file, 'utf8');

// The block to replace:
const search = `{/* Quick Facts Sidebar */}
          <div className="order-first md:order-last mb-8 md:mb-0 relative h-full">
            <div className={\`\${styles.glassCard} sticky top-[100px] gsap-fade-up\`}>`;

const replace = `{/* Quick Facts Sidebar */}
          <div className="order-first md:order-last mb-8 md:mb-0 relative">
            <div className="sticky top-[100px]">
              <div className={\`\${styles.glassCard} gsap-fade-up\`}>`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    
    // Now we need to add the closing div for the extra wrapper.
    // We can find the end of the Quick Facts Sidebar block.
    // It ends with:
    //                 </Link>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    
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
    console.log("Patched CourseBALLB.jsx successfully.");
} else {
    console.log("Could not find target block in CourseBALLB.jsx");
}
