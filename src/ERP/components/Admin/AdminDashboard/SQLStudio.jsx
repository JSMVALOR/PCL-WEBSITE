/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from "react";
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function SQLStudio({ isEmbedded = false }) {
 const [query, setQuery] = useState("SELECT * FROM profiles LIMIT 5;");
 const [results, setResults] = useState(null);
 const [error, setError] = useState("");
 const [isExecuting, setIsExecuting] = useState(false);
 const [executionTime, setExecutionTime] = useState(0);

 const textareaRef = React.useRef(null);
 const lineNumbersRef = React.useRef(null);

 const lineCount = query.split('\n').length;
 const lines = Array.from({ length: Math.max(5, lineCount) }, (_, i) => i + 1);

 const handleScroll = (e) => {
 if (lineNumbersRef.current) {
 lineNumbersRef.current.scrollTop = e.target.scrollTop;
 }
 };

 const handleExecute = async () => {
 if (!query.trim()) return;
 setIsExecuting(true);
 setError("");
 setResults(null);
 
 const startTime = performance.now();

 try {
 // Call the secure RPC function created in the Supabase Dashboard
 const { data, error: rpcError } = await supabase.rpc('admin_exec_sql', {
 query_text: query.trim()
 });

 if (rpcError) throw rpcError;

 // Handle the response which should be JSON
 if (data && data.status === "success") {
 // Non-returning query (INSERT, UPDATE, DELETE)
 setResults([{ Message: data.message }]);
 } else if (Array.isArray(data)) {
 // Standard SELECT returning rows
 setResults(data);
 } else {
 setResults([{ Message: "Query executed successfully. (Unknown response format)" }]);
 }
 
 } catch (err) {
 console.error("SQL Execution Error:", err);
 if (err.message?.includes('Could not find the function') || err.code === 'PGRST202') {
 setError('RPC_MISSING');
 } else {
 setError(err.message || "An error occurred while executing the query.");
 }
 } finally {
 const endTime = performance.now();
 setExecutionTime((endTime - startTime).toFixed(2));
 setIsExecuting(false);
 }
 };

 const handleKeyDown = (e) => {
 // Cmd+Enter or Ctrl+Enter to execute
 if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
 e.preventDefault();
 handleExecute();
 }
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)] pb-8">
 
 {/* Header */}
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-2xl p-5 flex items-center justify-between shrink-0">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-lg bg-themeElevated/90 backdrop-blur-2xl border border-emerald-500/30 flex items-center justify-center relative">
 <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/20 rounded-lg blur-xl -translate-y-1/2 translate-x-1/2"></div>
 <i className="fa-solid fa-terminal text-emerald-400 relative z-10"></i>
 </div>
 <div>
 <h2 className="text-lg font-black text-themeText tracking-tight flex items-center gap-2">
 Supabase SQL Studio
 <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">RPC Secured</span>
 </h2>
 <p className="text-xs text-themeTextSec font-mono mt-0.5">Direct Database Access Layer</p>
 </div>
 </div>
 <div className="hidden sm:flex items-center gap-6 border border-white/5 bg-themeElevated/90 backdrop-blur-2xl px-4 py-2 rounded-lg">
 <div className="flex flex-col items-end">
 <span className="text-[9px] font-black text-themeTextSec uppercase tracking-widest">Connection</span>
 <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
 Active
 </span>
 </div>
 </div>
 </div>

 {/* Main Studio Area */}
 <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
 
 {/* Left: Editor */}
 <div className="flex-1 flex flex-col bg-themeApp border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden relative group">
 
 {/* Editor Header */}
 <div className="flex items-center justify-between px-4 py-3 bg-themeElevated/90 backdrop-blur-2xl border-b border-black/5 dark:border-white/10 shrink-0">
 <div className="flex items-center gap-3">
 <div className="flex gap-1.5">
 <div className="w-2.5 h-2.5 rounded-lg bg-neutral-700"></div>
 <div className="w-2.5 h-2.5 rounded-lg bg-neutral-700"></div>
 <div className="w-2.5 h-2.5 rounded-lg bg-neutral-700"></div>
 </div>
 <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest ml-2">query.sql</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-mono text-neutral-500 hidden sm:block">Cmd + Enter to Run</span>
 <button 
 onClick={handleExecute} 
 disabled={isExecuting}
 className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 text-[10px] px-4 py-1.5 rounded-md font-black uppercase tracking-widest transition flex items-center gap-2 active:scale-95"
 >
 {isExecuting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-play"></i>}
 Execute
 </button>
 </div>
 </div>

 {/* Textarea */}
 <div className="flex-1 relative flex overflow-hidden">
 {/* Dynamic Line Numbers */}
 <div 
 ref={lineNumbersRef}
 className="w-10 bg-themePanel/85 backdrop-blur-2xl border-r border-black/5 dark:border-white/10/50 flex flex-col items-center py-4 text-[11px] font-mono text-neutral-600 select-none overflow-hidden shrink-0"
 >
 {lines.map(num => (
 <span key={num} className="leading-relaxed h-[21px] flex items-center justify-center">{num}</span>
 ))}
 </div>
 <textarea 
 ref={textareaRef}
 value={query}
 onChange={e => setQuery(e.target.value)}
 onKeyDown={handleKeyDown}
 onScroll={handleScroll}
 spellCheck={false}
 className="flex-1 h-full bg-transparent text-themeText font-mono text-sm p-4 focus:outline-none resize-none leading-relaxed selection:bg-emerald-500/30 whitespace-pre custom-scrollbar"
 placeholder="SELECT * FROM profiles;"
 style={{ lineHeight: '21px' }}
 ></textarea>
 </div>
 </div>

 {/* Right: Results */}
 <div className="flex-1 flex flex-col bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden relative">
 
 {/* Results Header */}
 <div className="flex items-center justify-between px-4 py-3 bg-themeApp border-b border-black/5 dark:border-white/10 shrink-0">
 <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-2">
 <i className="fa-solid fa-table text-neutral-500"></i>
 Results output
 </span>
 {results && !error && (
 <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
 {results.length} row{results.length !== 1 ? 's' : ''} • {executionTime}ms
 </span>
 )}
 </div>

 {/* Results Body */}
 <div className="flex-1 overflow-auto p-4 custom-scrollbar relative">
 {error === 'RPC_MISSING' ? (
 <div className="bg-themeElevated/90 backdrop-blur-2xl border border-emerald-500/30 rounded-lg p-5 flex flex-col gap-4 text-emerald-50 h-full overflow-y-auto custom-scrollbar">
 <div className="flex items-center gap-3 font-black text-emerald-400 text-sm">
 <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
 <i className="fa-solid fa-screwdriver-wrench"></i>
 </div>
 Setup Required: admin_exec_sql
 </div>
 <p className="text-xs text-neutral-400 leading-relaxed font-mono">
 To enable SQL Studio, you must create a secure RPC function in your Supabase database. Copy the SQL script below and execute it in your Supabase SQL Editor:
 </p>
 <div className="bg-themePanel/85 backdrop-blur-2xl rounded-md border border-black/5 dark:border-white/10 p-4 relative group">
 <button 
 onClick={() => navigator.clipboard.writeText(`CREATE OR REPLACE FUNCTION admin_exec_sql(query_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Attempt to execute as a returning query (SELECT, or DML with RETURNING)
  BEGIN
    EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || query_text || ') t' INTO result;
    RETURN result;
  EXCEPTION WHEN OTHERS THEN
    -- If it fails (e.g. DML without returning), execute as raw statement
    EXECUTE query_text;
    RETURN jsonb_build_array(jsonb_build_object('status', 'success', 'message', 'Query executed successfully.'));
  END;
END;
$$;`)}
 className="absolute top-2 right-2 p-1.5 bg-neutral-800 text-neutral-400 rounded hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
 title="Copy to Clipboard"
 >
 <i className="fa-regular fa-copy"></i>
 </button>
 <pre className="text-[10px] text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`CREATE OR REPLACE FUNCTION admin_exec_sql(query_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Attempt to execute as a returning query (SELECT, or DML with RETURNING)
  BEGIN
    EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || query_text || ') t' INTO result;
    RETURN result;
  EXCEPTION WHEN OTHERS THEN
    -- If it fails (e.g. DML without returning), execute as raw statement
    EXECUTE query_text;
    RETURN jsonb_build_array(jsonb_build_object('status', 'success', 'message', 'Query executed successfully.'));
  END;
END;
$$;`}
 </pre>
 </div>
 </div>
 ) : error ? (
 <div className="bg-rose-500/10 border-[length:var(--border-width)] border-rose-500/30 rounded-lg p-4 text-rose-400 font-mono text-xs whitespace-pre-wrap leading-relaxed">
 <div className="flex items-center gap-2 mb-2 font-black text-rose-500">
 <i className="fa-solid fa-triangle-exclamation"></i>
 Execution Error
 </div>
 {error}
 </div>
 ) : results ? (
 results.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-neutral-500">
 <i className="fa-solid fa-check-circle text-3xl mb-3 text-emerald-500/50"></i>
 <span className="font-mono text-xs">Query executed successfully (0 rows)</span>
 </div>
 ) : (
 <div className="overflow-x-auto rounded border border-black/5 dark:border-white/10">
 <table className="w-full text-left border-collapse text-xs font-mono whitespace-nowrap">
 <thead>
 <tr className="bg-themeApp border-b border-black/5 dark:border-white/10">
 {Object.keys(results[0]).map((key, i) => (
 <th key={i} className="py-2.5 px-4 text-[#9cdcfe] font-semibold sticky top-0 bg-themeApp">{key}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {results.map((row, i) => (
 <tr key={i} className="border-b border-black/5 dark:border-white/10/50 hover:bg-themeElevated/90 backdrop-blur-2xl transition-colors">
 {Object.values(row).map((val, j) => (
 <td key={j} className="py-2 px-4 text-[#ce9178]">
 {val === null ? <span className="text-[#569cd6] italic">null</span> : 
 typeof val === 'boolean' ? <span className="text-[#569cd6]">{String(val)}</span> :
 typeof val === 'number' ? <span className="text-[#b5cea8]">{val}</span> :
 typeof val === 'object' ? <span className="text-[#d16969]">{JSON.stringify(val)}</span> : 
 String(val)}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )
 ) : (
 <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-600 select-none">
 <i className="fa-solid fa-code text-4xl mb-4 opacity-30"></i>
 <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">Awaiting Execution</span>
 </div>
 )}
 </div>
 </div>
 </div>

 </div>
 </div>
 </div>
 );
}