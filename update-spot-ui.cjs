const fs = require('fs');

const heroFile = 'Frontend/Website/components/HOME/HERO/Hero.jsx';
let heroContent = fs.readFileSync(heroFile, 'utf8');

// Update hook call
heroContent = heroContent.replace('const { isAdmissionsOpen } = useSite();', 'const { isAdmissionsOpen, isSpotAdmissionsOpen } = useSite();');

// Update visual badge logic
heroContent = heroContent.replace(
  `{isAdmissionsOpen ? 'border-[var(--primary-color)]/50 text-[var(--primary-color)]' : 'border-rose-500/50 text-rose-500'}\`}`,
  `{isSpotAdmissionsOpen ? 'border-amber-500/50 text-amber-500' : isAdmissionsOpen ? 'border-[var(--primary-color)]/50 text-[var(--primary-color)]' : 'border-rose-500/50 text-rose-500'}\`}`
);
heroContent = heroContent.replace(
  `{isAdmissionsOpen ? 'bg-[var(--primary-color)] animate-pulse shadow-[0_0_10px_var(--primary-color)]' : 'bg-rose-500'}\`}></span>`,
  `{isSpotAdmissionsOpen ? 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]' : isAdmissionsOpen ? 'bg-[var(--primary-color)] animate-pulse shadow-[0_0_10px_var(--primary-color)]' : 'bg-rose-500'}\`}></span>`
);
heroContent = heroContent.replace(
  `{isAdmissionsOpen ? "Admissions Open 2026 - 2027" : "Admissions Closed 2026 - 2027"}`,
  `{isSpotAdmissionsOpen ? "Spot Admissions Drive 2026" : isAdmissionsOpen ? "Admissions Open 2026 - 2027" : "Admissions Closed 2026 - 2027"}`
);

// Update button logic
heroContent = heroContent.replace(
  `{isAdmissionsOpen ? (`,
  `{(isAdmissionsOpen || isSpotAdmissionsOpen) ? (`
);

fs.writeFileSync(heroFile, heroContent);

const navFile = 'Frontend/Website/components/NAVBAR/Navbar.jsx';
let navContent = fs.readFileSync(navFile, 'utf8');

navContent = navContent.replace('const { isAdmissionsOpen } = useSite();', 'const { isAdmissionsOpen, isSpotAdmissionsOpen } = useSite();');
navContent = navContent.replace(
  `{isAdmissionsOpen ? (`,
  `{(isAdmissionsOpen || isSpotAdmissionsOpen) ? (`
);
navContent = navContent.replace(
  `{isAdmissionsOpen ? 'Apply Now' : 'Contact Us'}`,
  `{isSpotAdmissionsOpen ? 'Spot Admissions' : isAdmissionsOpen ? 'Apply Now' : 'Contact Us'}`
);

fs.writeFileSync(navFile, navContent);

console.log('done');
