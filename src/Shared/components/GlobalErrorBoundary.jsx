import React from 'react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("System Crash Caught by Boundary:", error, errorInfo);
  }

  
  handleCopy = () => {
    const { error, errorInfo } = this.state;
    const log = `${error?.toString()}\n${errorInfo?.componentStack}`;
    navigator.clipboard.writeText(log).then(() => {
      // Small visual feedback could be nice, but a simple alert works for a crash boundary
      alert("Technical details copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy", err);
    });
  }

  handleReport = () => {
    const { error, errorInfo } = this.state;
    const subject = encodeURIComponent("🚨 PCL System Crash Report");
    const body = encodeURIComponent(`Hello Support,\n\nI experienced a crash on the PCL system.\n\nURL: ${window.location.href}\nBrowser: ${navigator.userAgent}\nTime: ${new Date().toISOString()}\n\n--- ERROR LOG ---\n${error?.toString()}\n\n${errorInfo?.componentStack}\n\n--- ADDITIONAL NOTES ---\n[Please describe what you were doing when the crash occurred]`);
    
    window.location.href = `mailto:contact@jsmvalor.in?subject=${subject}&body=${body}`;
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-[#f4f4f0] dark:bg-[#0a0a0a] text-black dark:text-white p-6 font-sans">
          <div className="max-w-xl w-full bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl rounded-[2rem] p-8 lg:p-12 flex flex-col items-center text-center">
            
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-rose-500/20">
              <i className="fa-solid fa-triangle-exclamation text-4xl"></i>
            </div>
            
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight mb-3">System Encountered an Error</h1>
            <p className="text-sm text-black/60 dark:text-white/60 mb-8 leading-relaxed">
              We apologize for the disruption. A critical error occurred while rendering this module. You can securely report this crash directly to our engineering team.
            </p>

            <div className="w-full flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-black dark:text-white rounded-full font-bold text-xs uppercase tracking-widest transition-colors"
              >
                <i className="fa-solid fa-rotate-right mr-2"></i> Reload Session
              </button>
              
              <button 
                onClick={this.handleReport}
                className="px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white shadow-[0_4px_15px_rgba(244,63,94,0.4)] rounded-full font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
              >
                <i className="fa-solid fa-paper-plane mr-2"></i> Report Issue
              </button>
            </div>
            
            <div className="mt-8 text-left w-full">
               <details className="bg-black/5 dark:bg-black/40 rounded-xl p-4 border border-black/5 dark:border-white/5 cursor-pointer">
                 <summary className="text-xs font-bold uppercase tracking-widest text-black/50 dark:text-white/50 outline-none flex justify-between items-center">
                   <span>View Technical Details</span>
                   <button onClick={this.handleCopy} className="px-3 py-1 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 rounded text-[9px] text-black dark:text-white transition-colors" title="Copy to Clipboard">
                     <i className="fa-regular fa-copy"></i> COPY
                   </button>
                 </summary>
                 <pre className="mt-4 text-[10px] text-rose-500 font-mono whitespace-pre-wrap overflow-x-auto">
                    {this.state.error?.toString()}
                    {this.state.errorInfo?.componentStack}
                 </pre>
               </details>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default GlobalErrorBoundary;
