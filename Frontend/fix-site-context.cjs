const fs = require('fs');
const file = 'Website/context/SiteContext.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const \[isAdmissionsOpen, setIsAdmissionsOpen\] = useState\(true\);/,
  `const [isAdmissionsOpen, setIsAdmissionsOpen] = useState(true);
    const [isSpotAdmissionsOpen, setIsSpotAdmissionsOpen] = useState(false);`
);

content = content.replace(
  /setIsAdmissionsOpen\(data\.value\.is_open !== false\);/g,
  `setIsAdmissionsOpen(data.value.is_open !== false);
                    setIsSpotAdmissionsOpen(data.value.is_spot === true);`
);

content = content.replace(
  /setIsAdmissionsOpen\(payload\.new\.value\.is_open !== false\);/g,
  `setIsAdmissionsOpen(payload.new.value.is_open !== false);
                    setIsSpotAdmissionsOpen(payload.new.value.is_spot === true);`
);

content = content.replace(
  /<SiteContext\.Provider value=\{\{ isAdmissionsOpen \}\}>/,
  `<SiteContext.Provider value={{ isAdmissionsOpen, isSpotAdmissionsOpen }}>`
);

fs.writeFileSync(file, content);
console.log('done');
