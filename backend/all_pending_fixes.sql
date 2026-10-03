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

-- 4. In case the legacy payment columns are needed for historical continuity in faculty_payroll
ALTER TABLE faculty_payroll
ADD COLUMN IF NOT EXISTS professional_tax NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tds_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tds_percentage NUMERIC DEFAULT 0;

