const fs = require('fs');
const file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

const newThemes = `
/* ADDITIONAL ERP THEMES */
[data-theme="apple-hig-light"] {
  --bg-app: #F2F2F7;
  --bg-panel: #FFFFFF;
  --bg-elevated: #FFFFFF;
  --text-primary: #000000;
  --text-secondary: #3C3C43;
  --accent: #007AFF;
  --accent-muted: #5AC8FA;
  --border-color: rgba(0, 0, 0, 0.05);
  --border-strong: rgba(0, 0, 0, 0.1);
  --text-on-accent: #FFFFFF;
}

[data-theme="royal-oxford"] {
  --bg-app: #0A1128;
  --bg-panel: #121A38;
  --bg-elevated: #1C264D;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --accent: #D4AF37;
  --accent-muted: #FCD34D;
  --border-color: rgba(212, 175, 55, 0.15);
  --border-strong: rgba(212, 175, 55, 0.3);
  --text-on-accent: #0A1128;
}

[data-theme="crimson-advocate"] {
  --bg-app: #2E0A16;
  --bg-panel: #3D0C1D;
  --bg-elevated: #5C122C;
  --text-primary: #FFF1F2;
  --text-secondary: #FECDD3;
  --accent: #FDA4AF;
  --accent-muted: #FB7185;
  --border-color: rgba(253, 164, 175, 0.15);
  --border-strong: rgba(253, 164, 175, 0.3);
  --text-on-accent: #4C0519;
}

[data-theme="imperial-crown"] {
  --bg-app: #FFF7ED;
  --bg-panel: #FFEDD5;
  --bg-elevated: #FED7AA;
  --text-primary: #431407;
  --text-secondary: #9A3412;
  --accent: #EA580C;
  --accent-muted: #C2410C;
  --border-color: rgba(234, 88, 12, 0.15);
  --border-strong: rgba(234, 88, 12, 0.3);
  --text-on-accent: #FFFFFF;
}

[data-theme="structural-neo-brutalism"] {
  --bg-app: #FFFFFF;
  --bg-panel: #F8F8F8;
  --bg-elevated: #FFFFFF;
  --text-primary: #000000;
  --text-secondary: #333333;
  --accent: #FF0000;
  --accent-muted: #CC0000;
  --border-color: #000000;
  --border-strong: #000000;
  --radius-panel: 0px;
  --radius-btn: 0px;
  --text-on-accent: #FFFFFF;
}
`;

// Just append the themes to the file, don't overwrite any of the existing website stuff.
// Wait, in `AppearanceSettings.jsx` I updated the list of themes. Does it match these keys?
// Yes: apple-hig-light, royal-oxford, crimson-advocate, imperial-crown, structural-neo-brutalism
content += newThemes;

fs.writeFileSync(file, content);
