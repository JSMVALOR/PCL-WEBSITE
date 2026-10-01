const fs = require('fs');
let linksPath = 'Frontend/Website/components/UI/PremiumFooter/LinksSection.jsx';
let linksContent = fs.readFileSync(linksPath, 'utf8');

linksContent = linksContent.replace(
  '<div className="brand-crest w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 group-hover:scale-105 transition-transform" style={{ width: "4rem", height: "4rem" }}></div>',
  '<div className="brand-crest !w-10 !h-10 md:!w-14 md:!h-14 lg:!w-16 lg:!h-16 group-hover:scale-105 transition-transform"></div>'
);

fs.writeFileSync(linksPath, linksContent);
