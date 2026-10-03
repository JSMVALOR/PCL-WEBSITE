-- ============================================================
-- Prudentia College of Law — Holiday Calendar 2026-27
-- Seed into academic_events table
-- Only real public/national holidays (no exams, no VIT-AP events)
-- ============================================================

-- Clear old holiday entries for this academic year to avoid duplicates
DELETE FROM academic_events 
WHERE event_type = 'Holiday' 
  AND start_date >= '2026-08-15' 
  AND start_date <= '2027-07-31';

-- Seed holidays
INSERT INTO academic_events (title, start_date, description, event_type, is_active) VALUES

-- Independence Day (also semester commencement day — but still a national holiday)
('Independence Day', '2026-08-15', 
 'India''s 80th Independence Day. No regular classes.', 
 'Holiday', true),

-- Milad-un-Nabi (Prophet Muhammad's Birthday)
('Milad-un-Nabi', '2026-08-26', 
 'Celebration of the birth of Prophet Muhammad. College closed.', 
 'Holiday', true),

-- Vinayaka Chaturthi (Ganesh Chaturthi)
('Vinayaka Chaturthi', '2026-09-14', 
 'Festival celebrating the birth of Lord Ganesha. College closed.', 
 'Holiday', true),

-- Mahatma Gandhi Jayanti
('Mahatma Gandhi Jayanti', '2026-10-02', 
 'Birth anniversary of Mahatma Gandhi — Father of the Nation. College closed.', 
 'Holiday', true),

-- Vijaya Dashami / Dussehra
('Vijaya Dashami / Dussehra', '2026-10-20', 
 'Festival celebrating the victory of good over evil. College closed.', 
 'Holiday', true),

-- Deepavali (multi-day)
('Deepavali', '2026-11-07', 
 'Festival of Lights — Day 1. College closed from 7th to 10th November.', 
 'Holiday', true),

('Deepavali (Day 2)', '2026-11-08', 
 'Festival of Lights — Day 2. College closed.', 
 'Holiday', true),

('Deepavali (Day 3)', '2026-11-09', 
 'Festival of Lights — Day 3. College closed.', 
 'Holiday', true),

('Deepavali (Day 4)', '2026-11-10', 
 'Festival of Lights — Day 4. College closed.', 
 'Holiday', true),

-- Republic Day
('Republic Day', '2027-01-26', 
 'India''s 78th Republic Day. College closed.', 
 'Holiday', true),

-- Maha Shivaratri (tentative — usually Feb/Mar)
('Maha Shivaratri', '2027-02-15', 
 'The Great Night of Shiva. College closed.', 
 'Holiday', true),

-- Holi
('Holi', '2027-03-14', 
 'Festival of Colours. College closed.', 
 'Holiday', true),

-- Ugadi / Telugu New Year
('Ugadi', '2027-03-29', 
 'Telugu and Kannada New Year. College closed.', 
 'Holiday', true),

-- Good Friday
('Good Friday', '2027-04-02', 
 'Commemoration of the crucifixion of Jesus Christ. College closed.', 
 'Holiday', true),

-- May Day / Labour Day
('May Day', '2027-05-01', 
 'International Workers'' Day. College closed.', 
 'Holiday', true);

-- Also add the semester start as an Academic event (not a holiday)
INSERT INTO academic_events (title, start_date, description, event_type, is_active) VALUES
('Commencement of Fall 2026-27 Semester', '2026-08-15', 
 'First day of the Fall 2026-27 academic session at Prudentia College of Law.', 
 'Academic', true);

-- Verify
SELECT title, start_date, event_type FROM academic_events 
WHERE start_date >= '2026-08-15' 
ORDER BY start_date;
