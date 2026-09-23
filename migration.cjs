const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Sw@ropp@1234@db.ltcsfdoawpmbdalisagj.supabase.co:5432/postgres',
});

async function run() {
  try {
    await client.connect();
    
    // Create mentorship_meetings
    await client.query(`
      CREATE TABLE IF NOT EXISTS mentorship_meetings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mentorship_id UUID REFERENCES mentorship(id) ON DELETE CASCADE,
        faculty_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        topic TEXT,
        scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
        meeting_link TEXT,
        status TEXT DEFAULT 'scheduled',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("mentorship_meetings table created/exists.");

    // Create mentorship_reports
    await client.query(`
      CREATE TABLE IF NOT EXISTS mentorship_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mentorship_id UUID REFERENCES mentorship(id) ON DELETE CASCADE,
        meeting_id UUID REFERENCES mentorship_meetings(id) ON DELETE CASCADE,
        faculty_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        faculty_feedback TEXT,
        student_feedback TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("mentorship_reports table created/exists.");

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

run();
