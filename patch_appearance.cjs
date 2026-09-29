const fs = require('fs');
let content = fs.readFileSync('Frontend/ERP/components/Student/Credentials/AppearanceSettings.jsx', 'utf8');

const newThemes = `    const themes = [
        { id: 'apple-hig-light', name: 'Pristine Alabaster', desc: 'Clean White & Red', icon: 'fa-sun', gradient: 'bg-gradient-to-br from-white via-white to-gray-100', accent: 'bg-[#E11D48]' },
        { id: 'midnight-justice', name: 'Obsidian Crimson', desc: 'Deep Black & Red', icon: 'fa-moon', gradient: 'bg-gradient-to-br from-black via-zinc-900 to-black', accent: 'bg-[#DC2626]' },
        { id: 'marble-executive', name: 'Nordic Slate', desc: 'Cool Slate & Rose', icon: 'fa-cloud-moon', gradient: 'bg-gradient-to-br from-slate-800 via-[#0B1120] to-slate-900', accent: 'bg-[#EF4444]' },
        { id: 'emerald-chancery', name: 'Rosewood Executive', desc: 'Warm White & Mahogany', icon: 'fa-leaf', gradient: 'bg-gradient-to-br from-red-50 via-white to-orange-50', accent: 'bg-[#991B1B]' },
        { id: 'crimson-advocate', name: 'Velvet Midnight', desc: 'Deep Plum & Ruby', icon: 'fa-gem', gradient: 'bg-gradient-to-br from-[#2E0A16] via-[#1A050C] to-black', accent: 'bg-[#FDA4AF]' },
        { id: 'imperial-crown', name: 'Autumn Hearth', desc: 'Warm Sand & Orange', icon: 'fa-fire', gradient: 'bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200', accent: 'bg-[#EA580C]' },
        { id: 'structural-neo-brutalism', name: 'Neo-Brutalism', desc: 'High Contrast Red', icon: 'fa-cube', gradient: 'bg-white', accent: 'bg-[#FF0000]' }
    ];`;

content = content.replace(/const themes = \[\s*\{[\s\S]*?\];/, newThemes);

fs.writeFileSync('Frontend/ERP/components/Student/Credentials/AppearanceSettings.jsx', content);
