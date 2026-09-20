const fs = require('fs');
let path = 'src/ERP/components/shared/DialogContainer.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes('SlideCommit')) {
    content = content.replace(
        /import \{ motion, AnimatePresence \} from "framer-motion";/,
        `import { motion, AnimatePresence } from "framer-motion";\nimport SlideCommit from "../../../Shared/components/ReactBits/SlideCommit/SlideCommit";`
    );
}

// Replace footer buttons
const footerRegex = /\{\/\* Footer Controls \*\/\}([\s\S]*?)<\/motion\.div>\s*<\/motion\.div>\s*\)\}\s*<\/AnimatePresence>/;
const newFooter = `{/* Footer Controls */}
                        <div className="p-4 border-t border-themeBorder dark:border-white/10 flex flex-col gap-3 relative z-10 w-full items-center">
                            {isPrompt ? (
                                <div className="flex gap-3 w-full">
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={dialogState.onCancel}
                                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-themeText dark:text-white border border-themeBorder dark:border-white/10 hover:border-white/30 rounded-xl font-bold tracking-widest text-[10px] transition-all"
                                    >Cancel</motion.button>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => dialogState.onConfirm(dialogState.inputValue)}
                                        className="flex-1 py-3 rounded-xl font-black tracking-widest text-[10px] transition-colors shadow-lg bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30 uppercase"
                                    >Submit</motion.button>
                                </div>
                            ) : isConfirm ? (
                                <div className="flex flex-col w-full gap-3">
                                    <div className="w-full h-14">
                                        <SlideCommit
                                            label="Slide to Confirm"
                                            doneLabel="Confirmed"
                                            onConfirm={async () => {
                                                await new Promise(r => setTimeout(r, 200));
                                                dialogState.onConfirm();
                                            }}
                                            width="100%"
                                            height={56}
                                            radius={16}
                                            className="w-full"
                                        />
                                    </div>
                                    <button 
                                        onClick={dialogState.onCancel}
                                        className="py-2.5 w-full rounded-xl bg-transparent text-themeTextSec dark:text-white/40 hover:bg-white/5 hover:text-white font-bold tracking-widest uppercase text-[10px] transition-all"
                                    >
                                        Cancel Request
                                    </button>
                                </div>
                            ) : (
                                <motion.button 
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => dialogState.onConfirm()}
                                    className="w-full py-3 rounded-xl font-black tracking-widest text-[10px] transition-colors shadow-lg bg-white/20 hover:bg-white/30 text-white shadow-none uppercase"
                                >
                                    Understood
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>`;

content = content.replace(footerRegex, newFooter);
fs.writeFileSync(path, content);
console.log("Dialog patched with SlideCommit.");
