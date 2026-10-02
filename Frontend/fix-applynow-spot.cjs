const fs = require('fs');
const file = 'Website/components/NAVBAR/APPLY_NOW/ApplyNow.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const \{ isAdmissionsOpen \} = useSite\(\);/,
  `const { isAdmissionsOpen, isSpotAdmissionsOpen } = useSite();`
);

content = content.replace(
  /Admissions\n          <\/span>/,
  `Admissions\n          </span>\n          {isSpotAdmissionsOpen && <span className="inline-block mt-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-widest rounded-full animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.2)]">🚨 Spot Admissions Active</span>}`
);

// If neither admissions are open, show closed. Otherwise show form.
// In ApplyNow:
// {!isAdmissionsOpen ? ( ...closed state... ) : isSuccess ? ( ... ) : ( ... form ... )}
// If isSpotAdmissionsOpen is true, we should allow it even if isAdmissionsOpen is false, 
// but usually Spot Admissions means admissions are open. Let's just adjust the condition.
content = content.replace(
  /\{!isAdmissionsOpen \? \(/,
  `{(!isAdmissionsOpen && !isSpotAdmissionsOpen) ? (`
);

fs.writeFileSync(file, content);
console.log('done');
