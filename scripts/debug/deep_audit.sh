#!/bin/bash
cd "/Users/JSM/Developer/JSM/PCL WEBSITE V6"

echo "===== LEAVE_REQUESTS QUERIES ====="
grep -rn "leave_requests" src/ERP --include="*.jsx" --include="*.js" | grep -v node_modules | grep -v ".bak"

echo ""
echo "===== LEAVE UI COLUMN REFERENCES (from_date, to_date, days, mentor_id, total_days, class_id, request_id, approver_name, document_path) ====="
grep -rn "leave\.\(from_date\|to_date\|days\b\|mentor_id\|total_days\|class_id\|request_id\|approver_name\|document_path\)" src/ERP --include="*.jsx" | grep -v node_modules | grep -v ".bak"

echo ""
echo "===== MARKS_LEDGER QUERIES ====="
grep -rn "marks_ledger" src/ERP --include="*.jsx" --include="*.js" | grep -v node_modules | grep -v ".bak"

echo ""
echo "===== ASSIGNMENT QUERIES ====="
grep -rn "from('assignments')" src/ERP --include="*.jsx" --include="*.js" | grep -v node_modules | grep -v ".bak"

echo ""
echo "===== ASSIGNMENT_SUBMISSIONS QUERIES ====="
grep -rn "assignment_submissions" src/ERP --include="*.jsx" --include="*.js" | grep -v node_modules | grep -v ".bak"

echo ""
echo "===== MENTORSHIP QUERIES ====="
grep -rn "from('mentorship')" src/ERP --include="*.jsx" --include="*.js" | grep -v node_modules | grep -v ".bak"

echo ""
echo "===== master_subjects.faculty_id REFERENCES ====="
grep -rn "master_subjects.*faculty_id\|faculty_id.*master_subjects" src/ERP --include="*.jsx" | grep -v node_modules | grep -v ".bak"

echo ""
echo "===== cohort_subject_id REFERENCES ====="
grep -rn "cohort_subject_id" src/ERP --include="*.jsx" | grep -v node_modules | grep -v ".bak"

echo ""
echo "===== class_sessions QUERIES ====="
grep -rn "from('class_sessions')" src/ERP --include="*.jsx" --include="*.js" | grep -v node_modules | grep -v ".bak"

echo ""
echo "===== ATTENDANCE_RECORDS QUERIES ====="
grep -rn "from('attendance_records')" src/ERP --include="*.jsx" --include="*.js" | grep -v node_modules | grep -v ".bak"

echo ""
echo "===== FK JOIN SYNTAX (table(col)) ====="
grep -rn "class_schedule(.*)\|master_subjects(.*)\|class_sessions(.*)" src/ERP --include="*.jsx" | grep -v node_modules | grep -v ".bak" | grep "select"
