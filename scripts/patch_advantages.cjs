const fs = require('fs');
let file = 'Frontend/Website/components/HOME/ADVANTAGES/Advantages.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the "Advantage." text visibility
// Change it from text-[var(--primary-color)] to text-[#F4EFE6] (Beige) to contrast beautifully against the black/dark-brown image
content = content.replace(
  'className="text-[var(--primary-color)] drop-shadow-[0_0_18px_var(--primary-glow)]">{heading2}</span>',
  'className="text-[var(--bg-app)] italic font-medium">{heading2}</span>'
);

// 2. Remove the muddy glow from BorderGlow
const oldBorderGlow = `const BorderGlow = ({ children }) => {
  return (
    <div className="relative group/glow rounded-[20px] p-[2px] transition-all duration-300">
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-[var(--primary-color)]/0 via-[var(--primary-color)]/0 to-[var(--primary-color)]/0 group-hover/glow:from-[var(--primary-color)]/60 group-hover/glow:via-[var(--primary-color)]/20 group-hover/glow:to-transparent opacity-0 group-hover/glow:opacity-100 transition-all duration-500 blur-sm pointer-events-none"></div>
      <div className="absolute inset-0 rounded-[20px] bg-[var(--card-bg)] shadow-[0_4px_24px_rgb(0,0,0,0.03)] z-0"></div>
      <div className="relative z-10 h-full rounded-[18px]">
        {children}
      </div>
    </div>
  );
};`;

const newBorderGlow = `const BorderGlow = ({ children }) => {
  return (
    <div className="relative group/glow rounded-[20px] p-[2px] transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 rounded-[20px] border border-transparent group-hover/glow:border-[var(--primary-color)]/30 group-hover/glow:shadow-[0_12px_30px_rgba(0,0,0,0.1)] transition-all duration-500 pointer-events-none"></div>
      <div className="absolute inset-[2px] rounded-[18px] bg-[var(--card-bg)] shadow-[0_4px_24px_rgb(0,0,0,0.03)] z-0"></div>
      <div className="relative z-10 h-full rounded-[18px]">
        {children}
      </div>
    </div>
  );
};`;

content = content.replace(oldBorderGlow, newBorderGlow);

fs.writeFileSync(file, content);
