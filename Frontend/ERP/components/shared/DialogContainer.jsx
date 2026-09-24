/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { registerDialogContainer } from "../../utils/DialogManager";
import { motion, AnimatePresence } from "framer-motion";
import SlideCommit from "../../../Shared/components/ReactBits/SlideCommit/SlideCommit";

export default function DialogContainer() {
    const [dialogState, setDialogState] = useState({
        isOpen: false,
        type: 'alert', // 'alert' | 'confirm'
        title: '',
        message: '',
        inputValue: '',
        onConfirm: () => {},
        onCancel: () => {} });

    useEffect(() => {
        registerDialogContainer(setDialogState);
    }, []);

    const isConfirm = dialogState.type === 'confirm';
    const isPrompt = dialogState.type === 'prompt';
    const isDanger = dialogState.type === 'danger';
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
                        className={`relative w-full max-w-sm backdrop-blur-[60px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border rounded-[2rem] overflow-hidden ${isAlert ? "bg-[#1c1c1c] dark:bg-[#161616] border-white/5" : isDanger ? "bg-[#1c1c1c] dark:bg-[#161616] border-white/5" : "bg-white/10 dark:bg-black/40 border-white/20"} `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Edge Specular */}
                        {/* Header */}
                        <div className="p-6 pb-4 flex flex-col items-center gap-4 text-center">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.1, stiffness: 400, damping: 25 }}
                                className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${(isConfirm || isPrompt) ? "bg-amber-500/20 border-amber-500/30 text-amber-500" : isDanger ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : isAlert ? (isError ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500") : "bg-white/20 border-white/30 text-themeText dark:text-white"}`}
                            >
                                <i className={`fa-solid text-xl ${(isConfirm || isPrompt) ? "fa-circle-question" : isDanger ? "fa-triangle-exclamation" : (isError ? "fa-xmark" : "fa-check")}`}></i>
                            </motion.div>
                            <h3 className={`font-black tracking-widest uppercase ${(isDanger || isAlert) ? 'text-white' : 'text-themeText dark:text-white'} text-lg drop-shadow-sm dark:drop-shadow-md`}>
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
                                    className="w-full bg-gray-50 dark:bg-black/20 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-rose-500/50 outline-none transition placeholder:text-themeTextSec dark:text-white/40"
                                    placeholder="Type here..."
                                />
                            </div>
                        )}

                        {/* Footer Controls */}
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
                            ) : isDanger ? (
                                <div className="flex gap-3 w-full justify-end mt-2">
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={dialogState.onCancel}
                                        className="px-5 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-white font-medium text-sm transition-all bg-[#2a2a2a] hover:bg-[#333333]"
                                    >Cancel</motion.button>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => dialogState.onConfirm()}
                                        className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                                    >{dialogState.confirmLabel || "Run query"}</motion.button>
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
                                    className={`w-full py-3 rounded-xl font-black tracking-widest text-[10px] transition-colors shadow-lg uppercase ${isAlert ? (isError ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20" : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20") : "bg-white/20 hover:bg-white/30 text-white shadow-none"}`}
                                >
                                    Understood
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
