/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("ERP Module Crash:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-black/5 dark:bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-rose-500/20 m-4">
                    <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
                        <i className="fa-solid fa-triangle-exclamation text-4xl text-rose-500"></i>
                    </div>
                    <h2 className="text-xl font-black text-themeText dark:text-white mb-2">Module Encountered a Critical Error</h2>
                    <p className="text-sm font-medium text-themeTextSec text-center max-w-md mb-6">
                        We apologize, but this specific module crashed while trying to render. 
                        The rest of your ERP is still fully functional.
                    </p>
                    <button 
                        onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                        className="px-6 py-3 bg-themeText dark:bg-white text-themeApp dark:text-black rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-transform"
                    >
                        Attempt Reload
                    </button>
                    {this.state.error && (
                        <div className="mt-8 p-4 bg-black/10 dark:bg-black/50 rounded-xl w-full max-w-2xl overflow-auto border border-black/10 dark:border-white/10">
                            <p className="text-xs text-rose-500 font-mono font-bold mb-2">{this.state.error.toString()}</p>
                            <pre className="text-[10px] text-themeTextSec font-mono whitespace-pre-wrap">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children; 
    }
}
