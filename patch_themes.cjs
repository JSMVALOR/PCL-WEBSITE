const fs = require('fs');
let content = fs.readFileSync('Frontend/index.css', 'utf8');

// Replace the entire data-theme block
const newThemes = `
  /* 1. Pristine Alabaster (Light) */
  [data-theme="apple-hig-light"] {
    --bg-app: #F8FAFC;
    --bg-panel: #FFFFFF;
    --bg-elevated: #FFFFFF;
    --text-primary: #0F172A;
    --text-secondary: #64748B;
    --accent: #E11D48;
    --accent-muted: #BE123C;
    --border-color: rgba(15, 23, 42, 0.08);
    --border-strong: rgba(15, 23, 42, 0.15);
    --shadow-elevated: 0 8px 30px rgba(0, 0, 0, 0.04);
    --text-on-accent: #FFFFFF;
  }

  /* 2. Obsidian Crimson (Dark) */
  [data-theme="midnight-justice"] {
    --bg-app: #000000;
    --bg-panel: #0A0A0A;
    --bg-elevated: #141414;
    --text-primary: #FAFAFA;
    --text-secondary: #A1A1AA;
    --accent: #DC2626;
    --accent-muted: #B91C1C;
    --border-color: rgba(255, 255, 255, 0.1);
    --border-strong: rgba(255, 255, 255, 0.2);
    --text-on-accent: #FFFFFF;
  }

  /* 3. Nordic Slate (Dark) */
  [data-theme="marble-executive"] {
    --bg-app: #0B1120;
    --bg-panel: #111827;
    --bg-elevated: #1F2937;
    --text-primary: #F8FAFC;
    --text-secondary: #94A3B8;
    --accent: #EF4444;
    --accent-muted: #DC2626;
    --border-color: rgba(255, 255, 255, 0.08);
    --border-strong: rgba(255, 255, 255, 0.15);
    --text-on-accent: #FFFFFF;
  }

  /* 4. Rosewood Executive (Light) */
  [data-theme="emerald-chancery"] {
    --bg-app: #FFFAFA;
    --bg-panel: #FFFFFF;
    --bg-elevated: #FFFFFF;
    --text-primary: #450A0A;
    --text-secondary: #991B1B;
    --accent: #991B1B;
    --accent-muted: #7F1D1D;
    --border-color: rgba(153, 27, 27, 0.1);
    --border-strong: rgba(153, 27, 27, 0.2);
    --text-on-accent: #FFFFFF;
  }

  /* 5. Velvet Midnight (Dark) */
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

  /* 6. Autumn Hearth (Warm Light) */
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

  /* 7. Structural Neo-Brutalism (Bold Red/White) */
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

const startIndex = content.indexOf('  [data-theme="apple-hig-light"] {');
const endIndex = content.indexOf('  [data-theme="marble-executive"] {', content.indexOf('  [data-theme="structural-neo-brutalism"] {')) + 100;
// Wait, better to replace using a split

const parts1 = content.split('  [data-theme="apple-hig-light"] {');
if(parts1.length === 2) {
    const parts2 = parts1[1].split('@layer utilities {');
    const newContent = parts1[0] + newThemes + '\n} /* END THEMES */\n\n@layer utilities {' + parts2[1];
    fs.writeFileSync('Frontend/index.css', newContent);
    console.log("Successfully replaced themes!");
} else {
    console.log("Could not find start index.");
}

