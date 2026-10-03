UPDATE site_faculty
SET designation = 'Assistant Professor of Law'
WHERE name ILIKE '%Supriya%';

CREATE TABLE IF NOT EXISTS erp_classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  course VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO erp_classrooms (name, course, year) VALUES
('BALLB - 1', 'BALLB', 1),
('BBALLB - 1', 'BBALLB', 1),
('LLB - 1', 'LLB', 1),
('LLB - 2', 'LLB', 2)
ON CONFLICT (name) DO NOTHING;
