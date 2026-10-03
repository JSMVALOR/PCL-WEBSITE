INSERT INTO whatsapp_templates (template_code, label, message_body) VALUES
('PAYROLL_DISBURSAL', 'Payroll Disbursal Alert', 'Dear {{faculty_name}},\n\nYour salary for the month of {{month}} {{year}} amounting to ₹{{net_pay}} has been successfully disbursed.\n\nYou can securely download your encrypted payslip directly from the Faculty Portal (HR & Payroll).\n\n- Accounts & HR, Prudentia College of Law')
ON CONFLICT (template_code) DO UPDATE 
SET label = EXCLUDED.label, message_body = EXCLUDED.message_body;
