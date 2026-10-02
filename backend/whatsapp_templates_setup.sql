-- Create the whatsapp_templates table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_code VARCHAR(255) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    message_body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Policies for anon access (since ERP uses anon key in some places)
CREATE POLICY "Allow anon read templates" ON whatsapp_templates FOR SELECT USING (true);
CREATE POLICY "Allow anon all templates" ON whatsapp_templates FOR ALL USING (true);

-- Insert perfected default templates
INSERT INTO whatsapp_templates (template_code, label, message_body) VALUES
('PARENT_ABSENT_ALERT', 'Attendance Alert (Parent)', 'Dear Parent, this is an automated alert from Prudentia College of Law. Your ward {{student_name}} was marked absent on {{date}} for {{period_count}} periods. Please ensure they attend classes regularly.'),
('NOTICE_BROADCAST', 'Notice / Broadcast', '📣 *{{category}}: {{title}}*\n\n{{content}}\n\n🔗 Link: {{link}}\n\n- Prudentia College of Law Admin'),
('HOLIDAY_REMINDER', 'Holiday Reminder', '🌟 *Holiday Alert: {{title}}*\n\nDear Students & Staff, please be informed that the college will remain closed on {{date}} for {{event_type}}.\n\nNote: {{description}}'),
('TIMETABLE_PUBLISHED', 'Timetable Published', '📅 *New Timetable Published*\n\nThe academic timetable for {{batch_name}} has been updated. Please check your student portal for the latest schedule.'),
('LEAVE_STATUS', 'Leave Status Update', 'Dear {{student_name}},\n\nYour {{leave_type}} leave request for dates {{dates}} has been marked as *{{status}}* by the administration.\n\n- Prudentia HR & Academics'),
('FEE_REMINDER', 'Fee Reminder', 'Dear {{student_name}},\n\nThis is a gentle reminder regarding your pending fee dues of ₹{{amount}}. Kindly clear it on or before {{due_date}} to avoid any late fees.\n\n- Accounts Dept, Prudentia College of Law')
ON CONFLICT (template_code) DO UPDATE 
SET label = EXCLUDED.label, message_body = EXCLUDED.message_body;

