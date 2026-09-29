const fs = require('fs');

let content = fs.readFileSync('Frontend/ERP/components/Student/Timetable/Timetable.jsx', 'utf8');

// Change the query to fetch the batch's theme color
content = content.replace(/const \{ data, error \} = await supabase\n \.from\('class_schedule'\)\n \.select\(`/g, `
            // Fetch cohort color dynamically
            const { data: batchData } = await supabase.from('academic_batches').select('theme_color, academic_programs(theme_color)').eq('name', batchStringName).single();
            const fetchedCohortColor = batchData?.academic_programs?.theme_color || batchData?.theme_color || 'blue';

            const { data, error } = await supabase
 .from('class_schedule')
 .select(\``);

// Replace hardcoded color logic
content = content.replace(/ \/\/ Sync cohort color for generic subjects\n let cohortColor = 'blue';\n const bName = batchStringName\.toUpperCase\(\);\n if \(bName\.includes\('BA LLB'\)\) cohortColor = 'rose';\n else if \(bName\.includes\('BBA LLB'\)\) cohortColor = 'emerald';\n else if \(bName\.includes\('LLM'\)\) cohortColor = 'purple';\n else if \(bName\.includes\('LLB'\)\) cohortColor = 'blue';/g, ' // Use dynamic cohort color fetched from DB\n const cohortColor = fetchedCohortColor;');

fs.writeFileSync('Frontend/ERP/components/Student/Timetable/Timetable.jsx', content);
console.log('Processed cohort color fetch in Timetable.jsx');
