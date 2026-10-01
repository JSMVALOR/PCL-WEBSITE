const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/shared/TopNav.jsx', 'utf8');

// Add state
file = file.replace(
    /const timeoutRef = useRef\(null\);/,
    `const timeoutRef = useRef(null);
 const [deferredPrompt, setDeferredPrompt] = useState(null);

 useEffect(() => {
     const handler = (e) => {
         e.preventDefault();
         setDeferredPrompt(e);
     };
     window.addEventListener('beforeinstallprompt', handler);
     return () => window.removeEventListener('beforeinstallprompt', handler);
 }, []);

 const handleInstallPWA = () => {
     if (deferredPrompt) {
         deferredPrompt.prompt();
         deferredPrompt.userChoice.then(() => {
             setDeferredPrompt(null);
         });
     }
 };`
);

// Add button
const rightActionsHook = '{/* Right: Actions */}\n <div className="flex items-center gap-3 shrink-0">';
const buttonHtml = `
 {deferredPrompt && (
     <button onClick={handleInstallPWA} className="hidden lg:flex items-center gap-2 bg-themeAccent text-themeApp px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-themeAccent/90 transition-all">
         <i className="fa-solid fa-download"></i> Install App
     </button>
 )}
`;

file = file.replace(rightActionsHook, rightActionsHook + buttonHtml);

fs.writeFileSync('Frontend/ERP/components/shared/TopNav.jsx', file);
