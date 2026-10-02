const fs = require('fs');
const file = 'Website/components/UI/AnnouncementBanner.jsx';
let content = fs.readFileSync(file, 'utf8');

// The file might use \`isAdmissionsOpen\` from \`useSite()\`.
content = content.replace(
  /const \{ isAdmissionsOpen \} = useSite\(\);/,
  `const { isAdmissionsOpen, isSpotAdmissionsOpen } = useSite();`
);

// We need to inject the Spot Admissions message into the banner if it's open.
// Since I don't know the exact structure, I will just do a simple replacement if possible, or I'll read it first.
