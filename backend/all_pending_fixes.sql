-- Fixes for Faculty Payroll Integration

-- 1. Add base_salary and salary_structure to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS base_salary NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS salary_structure JSONB DEFAULT '[
  {"name": "Basic Pay", "percentage": 50},
  {"name": "HRA", "percentage": 30},
  {"name": "Special Allowance", "percentage": 20}
]';

-- 2. Drop the old payroll_config from system_settings if it exists (since we removed Policy Engine)
DELETE FROM system_settings WHERE key = 'payroll_config';

-- 3. Ensure daily presence tracks late minutes correctly (already exists, but verifying)
ALTER TABLE faculty_daily_presence
ADD COLUMN IF NOT EXISTS total_missed_minutes INTEGER DEFAULT 0;

ALTER TABLE faculty_payroll
ADD COLUMN IF NOT EXISTS professional_tax NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tds_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tds_percentage NUMERIC DEFAULT 0;

-- 5. Missing columns for Leave Approval Flow
ALTER TABLE faculty_leaves 
ADD COLUMN IF NOT EXISTS replacement_status TEXT DEFAULT 'Not Required',
ADD COLUMN IF NOT EXISTS admin_remarks TEXT,
ADD COLUMN IF NOT EXISTS days NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS classes_affected JSONB DEFAULT '[]'::jsonb;

ALTER TABLE leave_requests
ADD COLUMN IF NOT EXISTS admin_remarks TEXT,
ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS request_id TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS days NUMERIC DEFAULT 0;

-- Add PAYROLL_DISBURSAL WhatsApp Template
INSERT INTO whatsapp_templates (template_code, label, message_body) VALUES
('PAYROLL_DISBURSAL', 'Payroll Disbursal Alert', 'Dear {{faculty_name}},

Your salary for the month of {{month}} {{year}} amounting to ₹{{net_pay}} has been successfully disbursed.

You can securely download your encrypted payslip directly from the Faculty Portal (HR & Payroll).

- Accounts & HR, Prudentia College of Law')
ON CONFLICT (template_code) DO UPDATE 
SET label = EXCLUDED.label, message_body = EXCLUDED.message_body;
