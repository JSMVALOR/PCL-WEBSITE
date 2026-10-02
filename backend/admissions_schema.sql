-- Ensure Admissions Applications Table exists
CREATE TABLE IF NOT EXISTS admissions_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    program TEXT,
    marks_10th TEXT,
    marks_inter TEXT,
    exam_tglawcet TEXT,
    exam_clat TEXT,
    status TEXT DEFAULT 'pending',
    erp_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure RLS is enabled
ALTER TABLE admissions_applications ENABLE ROW LEVEL SECURITY;

-- Allow anon insert for public website forms
CREATE POLICY "Allow anon insert on admissions" ON admissions_applications FOR INSERT WITH CHECK (true);

-- Allow authenticated read/update for Admin
CREATE POLICY "Allow auth read on admissions" ON admissions_applications FOR SELECT USING (true);
CREATE POLICY "Allow auth update on admissions" ON admissions_applications FOR UPDATE USING (true);
