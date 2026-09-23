const fs = require('fs');
const file = 'src/ERP/components/Student/Attendance/Attendance.jsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure import
if (!content.includes('CodeSlots')) {
    content = content.replace(
        "import React, { useState, useEffect, useMemo } from 'react';",
        "import React, { useState, useEffect, useMemo } from 'react';\nimport CodeSlots from '../../../../Shared/components/ReactBits/CodeSlots/CodeSlots';"
    );
}

// Replace OTP Input
const searchBlock = `<input 
 type="text"
 placeholder="e.g. A7X9P2"
 value={scanToken}
 onChange={(e) => setScanToken(e.target.value)}
 className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-xl px-4 py-3 text-center text-xl font-mono font-black text-themeText tracking-[0.2em] outline-none focus:border-themeAccent uppercase placeholder:tracking-normal placeholder:font-sans placeholder:font-bold placeholder:text-sm"
 maxLength={8}
 disabled={scanStatus !== 'idle'}
 />`;

const replaceBlock = `<div className="flex justify-center mt-2 mb-2">
    <CodeSlots
        length={8}
        value={scanToken}
        onChange={setScanToken}
        onComplete={(code) => {
            setScanToken(code);
            // Optionally auto-submit if scanStatus is idle
            if (scanStatus === 'idle') {
                // we simulate form submit by calling handleScanSubmit
                // but handleScanSubmit needs e.preventDefault(), so we mock it
                handleScanSubmit({ preventDefault: () => {} });
            }
        }}
        status={scanStatus === 'success' ? 'success' : scanStatus === 'error' ? 'error' : 'idle'}
        slotSize={38}
        gap={6}
        radius={10}
        accentColor="#007AFF"
        inkColor="#FFFFFF"
        slotColor="var(--bg-glass)"
        digitColor="var(--text-primary)"
        disabled={scanStatus !== 'idle'}
    />
 </div>`;

if (content.includes(searchBlock)) {
    content = content.replace(searchBlock, replaceBlock);
    fs.writeFileSync(file, content);
    console.log("Patched OTP input successfully!");
} else {
    console.log("Could not find OTP block. Let's try regex.");
    const re = /<input\s+type="text"\s+placeholder="e\.g\. A7X9P2"[\s\S]*?\/>/;
    if (re.test(content)) {
        content = content.replace(re, replaceBlock);
        fs.writeFileSync(file, content);
        console.log("Patched via regex.");
    }
}
