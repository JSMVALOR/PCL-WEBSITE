/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { registerDialogContainer } from "../../utils/DialogManager";
import { motion, AnimatePresence } from "framer-motion";

export default function DialogContainer() {
    const [dialogState, setDialogState] = useState({
        isOpen: false,
        type: 'alert', // 'alert' | 'confirm'
        title: '',
        message: '',
        inputValue: '',
        onConfirm: () => {},
        onCancel: () => {},
    });

    useEffect(() => {
        registerDialogContainer(setDialogState);
    }, []);

    const isConfirm = dialogState.type === 'confirm';
    const isPrompt = dialogState.type === 'prompt';
    const isError = dialogState.isError;
    const isAlert = dialogState.type === 'alert';

    return (
        <AnimatePresence>
            {dialogState.isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                >
                    {/* Dark Blurred Overlay */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-[20px]"
                        onClick={isConfirm ? dialogState.onCancel : dialogState.onConfirm}
                    />
                    
                    {/* Modal Content */}
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={`relative w-full max-w-sm backdrop-blur-[60px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border rounded-[2rem] overflow-hidden ${isAlert ? (isError ? "bg-rose-500/90 border-rose-400/50 shadow-rose-500/20" : "bg-emerald-500/90 border-emerald-400/50 shadow-emerald-500/20") : "bg-white/10 dark:bg-black/40 border-white/20"} `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Edge Specular */}
                        {/* Header */}
                        <div className="p-6 pb-4 flex flex-col items-center gap-4 text-center">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.1, stiffness: 400, damping: 25 }}
                                className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${(isConfirm || isPrompt) ? "bg-amber-500/20 border-amber-500/30 text-amber-500" : "bg-white/20 border-white/30 text-white"}`}
                            >
                                <i className={`fa-solid text-xl ${(isConfirm || isPrompt) ? "fa-circle-question" : (isError ? "fa-xmark" : "fa-check")}`}></i>
                            </motion.div>
                            <h3 className="font-black tracking-widest uppercase text-white text-lg drop-shadow-sm dark:drop-shadow-md">
                                {dialogState.title}
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="px-8 pb-8 text-center relative z-10">
                            <p className={`text-sm font-medium leading-relaxed whitespace-pre-wrap ${isAlert ? "text-white/90" : "text-white/90"}`}>
                                {dialogState.message}
                            </p>
                        </div>

                        
                        {isPrompt && (
                            <div className="px-8 pb-8 relative z-10 w-full">
                                <input 
                                    type="text" 
                                    autoFocus
                                    value={dialogState.inputValue || ""}
                                    onChange={(e) => setDialogState(prev => ({...prev, inputValue: e.target.value}))}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') dialogState.onConfirm(dialogState.inputValue);
                                        if (e.key === 'Escape') dialogState.onCancel();
                                    }}
                                    className="w-full bg-black/20 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-rose-500/50 outline-none transition placeholder:text-white/40"
                                    placeholder="Type here..."
                                />
                            </div>
                        )}

                        {/* Footer Controls */}
                        <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row gap-3 relative z-10">
                            {(isConfirm || isPrompt) && (
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={dialogState.onCancel}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/30 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                                >
                                    Cancel
                                </motion.button>
                            )}
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => isPrompt ? dialogState.onConfirm(dialogState.inputValue) : dialogState.onConfirm()}
                                className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors shadow-lg ${(isConfirm || isPrompt) ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30" : "bg-white/20 hover:bg-white/30 text-white shadow-none"}`}
                            >
                                {isPrompt ? 'Submit' : (isConfirm ? ((dialogState.title?.toLowerCase() || "").includes("sign out") || (dialogState.title?.toLowerCase() || "").includes("session") ? "Sign Out" : "Confirm") : "Understood")}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
