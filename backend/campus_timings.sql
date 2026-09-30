CREATE TABLE public.campus_timings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_type VARCHAR(50) NOT NULL, -- 'working_days' or 'period_slot'
    name VARCHAR(255) NOT NULL,
    start_time TIME,
    end_time TIME,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb, -- e.g. {"is_2nd_saturday": true, "is_4th_saturday": true}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Working Days (Mon - Sat)
INSERT INTO public.campus_timings (setting_type, name, sort_order, metadata) VALUES
('working_days', 'Monday', 1, '{}'),
('working_days', 'Tuesday', 2, '{}'),
('working_days', 'Wednesday', 3, '{}'),
('working_days', 'Thursday', 4, '{}'),
('working_days', 'Friday', 5, '{}'),
('working_days', 'Saturday', 6, '{"is_2nd_saturday": true, "is_4th_saturday": true}'::jsonb);

-- Insert Default 7 Periods
INSERT INTO public.campus_timings (setting_type, name, start_time, end_time, sort_order) VALUES
('period_slot', 'Period 1', '08:45:00', '09:45:00', 1),
('period_slot', 'Period 2', '09:45:00', '10:45:00', 2),
('period_slot', 'Period 3', '10:45:00', '11:45:00', 3),
('period_slot', 'Period 4', '11:45:00', '12:45:00', 4),
('period_slot', 'Period 5', '13:45:00', '14:45:00', 5),
('period_slot', 'Period 6', '14:45:00', '15:45:00', 6),
('period_slot', 'Period 7', '15:45:00', '16:45:00', 7);

ALTER TABLE public.campus_timings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.campus_timings FOR SELECT USING (true);
CREATE POLICY "Enable all access for admins" ON public.campus_timings USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
