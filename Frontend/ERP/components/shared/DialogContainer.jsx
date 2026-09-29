import React, { useState, useEffect } from "react";
import { registerDialogContainer } from "../../utils/DialogManager";
import { motion, AnimatePresence } from "framer-motion";
import SlideCommit from "../../../Shared/components/ReactBits/SlideCommit/SlideCommit";

export default function DialogContainer() {
    const [dialogState, setDialogState] = useState({
        isOpen: false,
        type: 'alert',
        title: '',
        message: '',
        inputValue: '',
        onConfirm: () => {},
        onCancel: () => {} });

    useEffect(() => {
        registerDialogContainer(setDialogState);
        return () => registerDialogContainer(null);
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
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={isConfirm ? dialogState.onCancel : dialogState.onConfirm}
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="relative w-full max-w-[340px] bg-white dark:bg-[#1a1a1a] shadow-2xl border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 flex flex-col items-center gap-3 text-center">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.1, stiffness: 400, damping: 25 }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${dialogState.isSuccess ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400" : (isConfirm || isPrompt) ? "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400" : isDanger ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400" : isAlert ? (isError ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400" : "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400") : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white"}`}
                            >
                                <i className={`fa-solid text-lg ${dialogState.isSuccess ? "fa-check" : (isConfirm || isPrompt) ? "fa-circle-question" : isDanger ? "fa-triangle-exclamation" : (isError ? "fa-xmark" : "fa-check")}`}></i>
                            </motion.div>
                            <div className="space-y-1 mt-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-[15px] tracking-tight">
                                    {dialogState.title}
                                </h3>
                                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap px-2">
                                    {dialogState.message}
                                </p>
                            </div>
                        </div>

                        {isPrompt && (
                            <div className="px-6 pb-6 relative z-10 w-full">
                                <input 
                                    type="text" 
                                    autoFocus
                                    value={dialogState.inputValue || ""}
                                    onChange={(e) => setDialogState(prev => ({...prev, inputValue: dialogState.uppercase ? e.target.value.toUpperCase() : e.target.value}))}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') dialogState.onConfirm(dialogState.inputValue);
                                        if (e.key === 'Escape') dialogState.onCancel();
                                    }}
                                    className={`w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:border-blue-500 outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-500 ${dialogState.uppercase ? "uppercase" : ""}`}
                                    placeholder="Type here..."
                                />
                            </div>
                        )}

                        <div className="p-4 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 flex flex-col gap-2 relative z-10 w-full items-center">
                            {isPrompt ? (
                                <div className="flex gap-2 w-full">
                                    <button 
                                        onClick={dialogState.onCancel}
                                        className="flex-1 py-2.5 bg-white dark:bg-[#222] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl font-medium text-[13px] transition-all"
                                    >Cancel</button>
                                    <button 
                                        onClick={() => dialogState.onConfirm(dialogState.inputValue)}
                                        className="flex-1 py-2.5 rounded-xl font-medium text-[13px] transition-colors bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                    >Submit</button>
                                </div>
                            ) : isDanger ? (
                                <div className="flex gap-2 w-full mt-1">
                                    <button 
                                        onClick={dialogState.onCancel}
                                        className="flex-1 py-2.5 bg-white dark:bg-[#222] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl font-medium text-[13px] transition-all"
                                    >Cancel</button>
                                    <button 
                                        onClick={() => dialogState.onConfirm()}
                                        className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-[13px] transition-colors shadow-sm"
                                    >{dialogState.confirmLabel || "Confirm"}</button>
                                </div>
                            ) : isConfirm ? (
                                <div className="flex flex-col w-full gap-2">
                                    <div className="flex gap-2 w-full">
                                        <button 
                                            onClick={dialogState.onCancel}
                                            className="flex-1 py-2.5 bg-white dark:bg-[#222] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl font-medium text-[13px] transition-all"
                                        >Cancel</button>
                                        <button 
                                            onClick={() => dialogState.onConfirm()}
                                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-[13px] transition-colors shadow-sm"
                                        >Confirm</button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => dialogState.onConfirm()}
                                    className="w-full py-2.5 rounded-xl font-medium text-[13px] transition-colors bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black shadow-sm"
                                >
                                    OK
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
