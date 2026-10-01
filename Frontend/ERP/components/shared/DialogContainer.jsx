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
 className="relative w-full max-w-[340px] bg-themePanel shadow-2xl border border-themeBorder rounded-2xl overflow-hidden"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="p-6 flex flex-col items-center gap-3 text-center">
 <motion.div 
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ type: "spring", delay: 0.1, stiffness: 400, damping: 25 }}
 className={`w-12 h-12 rounded-full flex items-center justify-center ${dialogState.isSuccess ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400" : (isConfirm || isPrompt) ? "bg-themeAccent/10 text-themeAccent" : isDanger ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400" : isAlert ? (isError ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400" : "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400") : "bg-themeElevated text-themeTextSec "}`}
 >
 <i className={`fa-solid text-lg ${dialogState.isSuccess ? "fa-check" : (isConfirm || isPrompt) ? "fa-circle-question" : isDanger ? "fa-triangle-exclamation" : (isError ? "fa-xmark" : "fa-check")}`}></i>
 </motion.div>
 <div className="space-y-1 mt-1">
 <h3 className="font-semibold text-themeText text-[15px] tracking-tight">
 {dialogState.title}
 </h3>
 <p className="text-[13px] text-themeTextSec leading-relaxed whitespace-pre-wrap px-2">
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
 className={`w-full bg-themeApp /50 border border-themeBorder rounded-xl px-4 py-2.5 text-sm font-medium text-themeText focus:border-themeAccent outline-none transition placeholder:text-themeTextSec/70 dark:placeholder:text-themeTextSec ${dialogState.uppercase ? "uppercase" : ""}`}
 placeholder="Type here..."
 />
 </div>
 )}

 <div className="p-4 bg-themeApp/50 /20 border-t border-themeBorder flex flex-col gap-2 relative z-10 w-full items-center">
 {isPrompt ? (
 <div className="flex gap-2 w-full">
 <button 
 onClick={dialogState.onCancel}
 className="flex-1 py-2.5 bg-themePanel hover:bg-themeApp hover:bg-themeBorder/50 text-themeTextSec hover:text-themeText border border-themeBorder rounded-xl font-medium text-[13px] transition-all"
 >Cancel</button>
 <button 
 onClick={() => dialogState.onConfirm(dialogState.inputValue)}
 className="flex-1 py-2.5 rounded-xl font-medium text-[13px] transition-colors bg-themeAccent hover:bg-themeAccent/90 text-themeApp shadow-sm"
 >Submit</button>
 </div>
 ) : isDanger ? (
 <div className="flex gap-2 w-full mt-1">
 <button 
 onClick={dialogState.onCancel}
 className="flex-1 py-2.5 bg-themePanel hover:bg-themeApp hover:bg-themeBorder/50 text-themeTextSec hover:text-themeText border border-themeBorder rounded-xl font-medium text-[13px] transition-all"
 >Cancel</button>
 <button 
 onClick={() => dialogState.onConfirm()}
 className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-themeApp font-medium text-[13px] transition-colors shadow-sm"
 >{dialogState.confirmLabel || "Confirm"}</button>
 </div>
 ) : isConfirm ? (
 <div className="flex flex-col w-full gap-2">
 <div className="flex gap-2 w-full">
 <button 
 onClick={dialogState.onCancel}
 className="flex-1 py-2.5 bg-themePanel hover:bg-themeApp hover:bg-themeBorder/50 text-themeTextSec hover:text-themeText border border-themeBorder rounded-xl font-medium text-[13px] transition-all"
 >Cancel</button>
 <button 
 onClick={() => dialogState.onConfirm()}
 className="flex-1 py-2.5 bg-themeAccent hover:bg-themeAccent/90 text-themeApp rounded-xl font-medium text-[13px] transition-colors shadow-sm"
 >Confirm</button>
 </div>
 </div>
 ) : (
 <button 
 onClick={() => dialogState.onConfirm()}
 className="w-full py-2.5 rounded-xl font-medium text-[13px] transition-colors bg-themeText text-themeApp hover:opacity-90 shadow-sm"
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
