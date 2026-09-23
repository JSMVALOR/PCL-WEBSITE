import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ltcsfdoawpmbdalisagj.supabase.co'
const supabaseAnonKey = 'sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    const { data: batchData } = await supabase.from('academic_batches').select('id, program_id').eq('name', 'LLB (Class of 2029)').single();
    if (batchData) {
        const { data, error } = await supabase
            .from('cohort_subjects')
            .select('id, master_subject_id, master_subjects(id, name, code, syllabus, target_semester)')
            .eq('batch_id', batchData.id);
        console.log("Cohort Subjects:", JSON.stringify(data, null, 2));
    }
}
run();
