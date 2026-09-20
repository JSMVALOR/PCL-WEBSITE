const fs = require('fs');

const path = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update the select query to fetch theme_color
content = content.replace(
    /master_subjects\(id, name, code, credits, syllabus\)/g,
    'master_subjects(id, name, code, credits, syllabus, theme_color)'
);

// 2. Add full THEME_COLORS object if missing some colors
if (!content.includes('cyan:')) {
    content = content.replace(
        /default: { primary: '#007AFF', bg: 'rgba\(0,122,255,0\.1\)' }/,
        `cyan: { primary: '#32ADE6', bg: 'rgba(50,173,230,0.1)' },\n    pink: { primary: '#FF2D55', bg: 'rgba(255,45,85,0.1)' },\n    fuchsia: { primary: '#AF52DE', bg: 'rgba(175,82,222,0.1)' },\n    default: { primary: '#007AFF', bg: 'rgba(0,122,255,0.1)' }`
    );
}

// 3. Update the card mapping logic
// Replace: const tColor = THEME_COLORS[getBatchColorKey(batchStr)] || THEME_COLORS.default;
// With: const tColor = THEME_COLORS[course.master_subjects?.theme_color] || THEME_COLORS.default;
content = content.replace(
    /const tColor = THEME_COLORS\[getBatchColorKey\(batchStr\)\] \|\| THEME_COLORS\.default;/g,
    'const tColor = THEME_COLORS[course.master_subjects?.theme_color] || THEME_COLORS.default;'
);

// 4. Update the card style to be glassmorphic
// Replace: className={`bg-themeApp border rounded-[1.25rem]
// With: className={`bg-white/60 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border rounded-[1.25rem]
content = content.replace(
    /className=\{\`bg-themeApp border rounded-\[1\.25rem\]/g,
    'className={`bg-white/60 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border rounded-[1.25rem]'
);

// 5. Enhance the active ring and shadows
// Replace: isSelected ? 'ring-1 ring-black/10 dark:ring-white/10 shadow-2xl bg-transparent z-10 scale-[1.01]' : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:shadow-lg'
// With glassmorphic active states
content = content.replace(
    /isSelected \? 'ring-1 ring-black\/10 dark:ring-white\/10 shadow-2xl bg-transparent z-10 scale-\[1\.01\]' : 'border-black\/5 dark:border-white\/5 hover:border-black\/10 dark:hover:border-white\/10 hover:shadow-lg'/g,
    'isSelected ? \'ring-2 shadow-2xl bg-white dark:bg-themePanel z-10 scale-[1.01]\' : \'border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 hover:shadow-lg\''
);

fs.writeFileSync(path, content);
console.log("Updated FacultyCourses.jsx with theme colors and glassmorphism!");
