import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Fetching faculties...");
  const { data: faculties } = await supabase.from('profiles').select('id, full_name, department').eq('role', 'faculty');
  
  const getFac = (nameFrag) => {
      const f = faculties.find(f => f.full_name && f.full_name.toLowerCase().includes(nameFrag.toLowerCase()));
      return f ? f.id : (faculties[Math.floor(Math.random() * faculties.length)]?.id);
  };

  console.log("Ensuring Moot Court exists in master_subjects...");
  let { data: mootMaster } = await supabase.from('master_subjects').select('id').eq('name', 'Moot Court Session').limit(1);
  let mootMasterId;
  if (!mootMaster || mootMaster.length === 0) {
      const { data: batches } = await supabase.from('academic_batches').select('program_id').limit(1);
      const program_id = batches && batches.length > 0 ? batches[0].program_id : null;
      
      const { data: newMoot } = await supabase.from('master_subjects').insert([{
          program_id: program_id,
          name: 'Moot Court Session',
          code: 'MOOT-101',
          target_semester: 1,
          credits: 2,
          theme_color: 'rose',
          type: 'Practical'
      }]).select();
      mootMasterId = newMoot && newMoot.length > 0 ? newMoot[0].id : null;
  } else {
      mootMasterId = mootMaster[0].id;
  }

  console.log("Fetching all master_subjects...");
  const { data: masterSubjects } = await supabase.from('master_subjects').select('*');

  console.log("Fetching batches...");
  const { data: batches } = await supabase.from('academic_batches').select('*');
  
  if (!batches || batches.length === 0) {
      console.log("No batches found.");
      return;
  }

  console.log("Creating cohort_subjects links...");
  await supabase.from('cohort_subjects').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  const cohortInserts = [];
  
  for (const batch of batches) {
      // pick 4 random subjects from master_subjects
      let bSubjects = [...masterSubjects].filter(s => s.id !== mootMasterId).sort(() => 0.5 - Math.random()).slice(0, 4);
      // ensure Moot Court is added
      const mootObj = masterSubjects.find(s => s.id === mootMasterId);
      if (mootObj) bSubjects.push(mootObj);
      
      for (const ms of bSubjects) {
          cohortInserts.push({
              batch_id: batch.id,
              master_subject_id: ms.id,
              faculty_id: getFac('') // Assign random faculty
          });
      }
  }

  const { data: cohortData, error: cohortErr } = await supabase.from('cohort_subjects').insert(cohortInserts).select();
  if (cohortErr) {
      console.error("Failed to insert cohort_subjects", cohortErr);
      return;
  }
  
  console.log(`Inserted ${cohortData.length} cohort subjects.`);

  console.log("Fetching rooms...");
  const { data: rooms } = await supabase.from('academic_classrooms').select('*');
  let defaultRoomId = rooms && rooms.length > 0 ? rooms[0].id : null;
  if (!defaultRoomId) {
      const { data: newRoom } = await supabase.from('academic_classrooms').insert([{ name: 'Moot Court Hall', capacity: 100, is_active: true }]).select();
      defaultRoomId = newRoom && newRoom.length > 0 ? newRoom[0].id : null;
  }

  console.log("Deleting old schedules...");
  await supabase.from('class_schedule').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  const timeSlots = [
      { start: '09:00:00', end: '09:45:00' },
      { start: '09:50:00', end: '10:35:00' },
      // break 10:35 - 10:50
      { start: '10:50:00', end: '11:35:00' },
      { start: '11:40:00', end: '12:25:00' },
      { start: '12:25:00', end: '13:20:00' }
  ];

  const scheduleInserts = [];

  for (const batch of batches) {
      // Find the cohort_subjects for this batch
      const batchCohortSubjects = cohortData.filter(c => c.batch_id === batch.id);

      for (let day = 1; day <= 5; day++) { // Mon-Fri
          const dailySubjects = [...batchCohortSubjects].sort(() => 0.5 - Math.random());
          
          for (let slot = 0; slot < 5; slot++) {
              if (dailySubjects.length === 0) break;
              const sub = dailySubjects[slot % dailySubjects.length];
              scheduleInserts.push({
                  batch: batch.name,
                  subject_id: sub.id, // This is cohort_subjects.id
                  room_id: defaultRoomId,
                  faculty_id: sub.faculty_id,
                  day_of_week: day,
                  start_time: timeSlots[slot].start,
                  end_time: timeSlots[slot].end,
                  status: 'Scheduled'
              });
          }
      }
  }

  console.log(`Inserting ${scheduleInserts.length} classes...`);
  if (scheduleInserts.length > 0) {
      const { error: insErr } = await supabase.from('class_schedule').insert(scheduleInserts);
      if (insErr) {
          console.error("Failed to insert schedules", insErr);
      } else {
          console.log("Successfully generated timetables for all batches including Moot Court!");
      }
  }
}
run();
