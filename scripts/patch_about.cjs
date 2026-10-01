const fs = require('fs');
const file = 'Frontend/Website/components/NAVBAR/ABOUT/About.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix subtext color on Leadership cards (it's on a black gradient, so make it bright gold/beige)
content = content.replace(
  'className="text-[var(--primary-color)] uppercase tracking-widest text-xs md:text-sm font-semibold mb-6 transform translate-y-8',
  'className="text-[#d4b998] uppercase tracking-widest text-xs md:text-sm font-semibold mb-6 transform translate-y-8'
);

// 2. Fix the drop-cap P font to use Playfair Display
content = content.replace(
  `style={{ fontSize: '4.5rem', lineHeight: '0.9' }}>`,
  `style={{ fontSize: '4.5rem', lineHeight: '0.9', fontFamily: "'Playfair Display', serif" }}>`
);

// 3. Reduce space below photos and footer
// Replace pb-[100px] with pb-[40px]
content = content.replace(/pb-\[100px\]/g, 'pb-[40px]');

fs.writeFileSync(file, content);
