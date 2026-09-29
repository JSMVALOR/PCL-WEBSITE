const fs = require('fs');
let content = fs.readFileSync('Frontend/ERP/components/notices/EventsBoard.jsx', 'utf8');

// Replace the boxed dashed empty state with a clean unboxed one
content = content.replace(
    /<div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black\/5 dark:bg-white\/5 backdrop-blur-2xl border-2 border-dashed border-black\/10 dark:border-white\/10 rounded-\[2rem\] text-center px-4">/,
    '<div className="w-full py-12 flex flex-col items-center justify-center border-b border-black/5 dark:border-white/10 text-center px-4">'
);

// Match "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" to "flex overflow-x-auto snap-x no-scrollbar gap-6 pb-6"
content = content.replace(
    /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">/,
    '<div className="flex overflow-x-auto snap-x no-scrollbar gap-6 pb-6">'
);

// In the map function, add min-w-[320px] max-w-[320px] snap-start shrink-0 to the event cards to make them horizontal cards
content = content.replace(
    /className=\{\`bg-white\/70 dark:bg-white\/\[0\.03\] backdrop-blur-3xl saturate-\[1\.8\] border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] shadow-\[0_8px_30px_rgb\(0,0,0,0\.12\)\] dark:shadow-\[0_8px_30px_rgb\(0,0,0,0\.4\)\] rounded-2xl overflow-hidden cursor-pointer group transition-all hover:scale-\[1\.01\]  overflow-hidden \$\{isPast \? 'opacity-60' : ''\}\`\}/,
    'className={`min-w-[320px] max-w-[320px] shrink-0 snap-start bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden cursor-pointer group transition-all hover:scale-[1.01] ${isPast ? \'opacity-60\' : \'\'}`}'
);

fs.writeFileSync('Frontend/ERP/components/notices/EventsBoard.jsx', content);
console.log("Patched EventsBoard.");
