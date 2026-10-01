const fs = require('fs');
let file = 'Frontend/Website/components/HOME/ADVANTAGES/BorderGlow.jsx';
let content = fs.readFileSync(file, 'utf8');

const newBorderGlow = `const BorderGlow = ({ children }) => {
  return (
    <div className="relative group/glow rounded-[20px] p-[2px] transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 rounded-[20px] border border-[var(--primary-color)]/0 group-hover/glow:border-[var(--primary-color)]/30 group-hover/glow:shadow-[0_12px_30px_rgba(0,0,0,0.1)] transition-all duration-500 pointer-events-none"></div>
      <div className="absolute inset-[2px] rounded-[18px] bg-[var(--card-bg)] shadow-[0_4px_24px_rgb(0,0,0,0.03)] z-0"></div>
      <div className="relative z-10 h-full rounded-[18px] overflow-hidden">
        {children}
      </div>
    </div>
  );
};
export default BorderGlow;`;

// Let's check what the old content is so we don't assume.
// Actually, let's just write the whole file since it's a very tiny component.
// Wait, I should make sure it imports React.
const fullContent = `import React from 'react';\n\n` + newBorderGlow;
fs.writeFileSync(file, fullContent);
