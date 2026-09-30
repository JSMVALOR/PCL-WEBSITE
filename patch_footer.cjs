const fs = require('fs');

// Patch LinksSection.jsx
let linksPath = 'Frontend/Website/components/UI/PremiumFooter/LinksSection.jsx';
let linksContent = fs.readFileSync(linksPath, 'utf8');

// Replace img with brand-crest div
linksContent = linksContent.replace(
  /<img decoding="async" loading="lazy"[\s\S]*?className="h-8 md:h-14 lg:h-16 w-auto group-hover:scale-105 transition-transform theme-logo"[\s\S]*?\/>/,
  '<div className="brand-crest w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 group-hover:scale-105 transition-transform" style={{ width: "4rem", height: "4rem" }}></div>'
);

// Remove dark: classes
linksContent = linksContent.replace(/dark:[^\s"']+/g, '');
fs.writeFileSync(linksPath, linksContent);


// Patch BottomStrip.jsx
let bottomPath = 'Frontend/Website/components/UI/PremiumFooter/BottomStrip.jsx';
let bottomContent = fs.readFileSync(bottomPath, 'utf8');

// Remove dark: classes
bottomContent = bottomContent.replace(/dark:[^\s"']+/g, '');

// Fix JSM VALOR colors to use CSS variables
bottomContent = bottomContent.replace(
  /className="text-black font-bold tracking-widest text-sm"/g,
  'className="text-[var(--text-primary)] font-bold tracking-widest text-sm"'
);
bottomContent = bottomContent.replace(
  /className="text-black font-black tracking-tight ml-1 text-sm"/g,
  'className="text-[var(--text-primary)] font-black tracking-tight ml-1 text-sm"'
);

// Fix "Privacy" / "Terms" links
bottomContent = bottomContent.replace(
  /className="hover:text-black transition-colors"/g,
  'className="hover:text-[var(--text-primary)] transition-colors"'
);

// Fix Back To Top button
bottomContent = bottomContent.replace(
  /hover:text-black transition-colors/g,
  'hover:text-[var(--text-primary)] transition-colors'
);

fs.writeFileSync(bottomPath, bottomContent);
