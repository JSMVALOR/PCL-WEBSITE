const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env'));
const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_SERVICE_ROLE_KEY || envConfig.VITE_SUPABASE_ANON_KEY);

const sql = `
-- Create Moot Court Competitions
CREATE TABLE IF NOT EXISTS public.moot_court_competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Internal', 'External')),
    start_date DATE NOT NULL,
    end_date DATE,
    venue TEXT,
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Moot Court Teams
CREATE TABLE IF NOT EXISTS public.moot_court_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES public.moot_court_competitions(id) ON DELETE CASCADE,
    team_code TEXT NOT NULL,
    faculty_mentor_id UUID REFERENCES public.profiles(id),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Eliminated', 'Winner', 'Runner-up')),
    memorial_score NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Legal Aid Cases
CREATE TABLE IF NOT EXISTS public.legal_aid_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    assigned_faculty_id UUID REFERENCES public.profiles(id),
    pro_bono_hours NUMERIC(6,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.moot_court_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moot_court_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_aid_cases ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read/write for MVP
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.moot_court_competitions;
CREATE POLICY "Enable all access for authenticated users" ON public.moot_court_competitions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.moot_court_teams;
CREATE POLICY "Enable all access for authenticated users" ON public.moot_court_teams FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.legal_aid_cases;
CREATE POLICY "Enable all access for authenticated users" ON public.legal_aid_cases FOR ALL TO authenticated USING (true) WITH CHECK (true);
`;

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error("RPC exec_sql failed, trying direct REST or telling user to run it.", error.message);
  } else {
    console.log("Tables created successfully");
  }
}
run();
