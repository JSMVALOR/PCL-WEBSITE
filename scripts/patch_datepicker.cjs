const fs = require('fs');
const file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

const newStyles = `
/* Custom Date Picker Styling */
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  filter: invert(0.5); /* Makes the icon visible in both light and dark modes */
}
input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

/* Force dark color scheme on date inputs when in dark theme */
[data-theme="crimson-advocate"] input[type="date"],
[data-theme="royal-oxford"] input[type="date"],
[data-theme="apple-hig-light"] input[type="date"],
[data-theme="imperial-crown"] input[type="date"],
html.dark input[type="date"] {
  color-scheme: dark;
}

[data-theme="apple-hig-light"] input[type="date"],
[data-theme="imperial-crown"] input[type="date"],
[data-theme="structural-neo-brutalism"] input[type="date"],
html:not(.dark) input[type="date"] {
  color-scheme: light;
}
`;

if (!content.includes('::-webkit-calendar-picker-indicator')) {
  content += newStyles;
  fs.writeFileSync(file, content);
}
