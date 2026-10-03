-- Upsert website Academic Calendar Grid to system_settings
 INSERT INTO system_settings (key, value)
 VALUES (
   'academic_calendar_grid',
   '{
     "columns": ["DESCRIPTION", "DATES AND DAYS", "DETAILS AND REMARKS"],
     "rows": [
       {
         "id": 1,
         "data": {
           "DESCRIPTION": "Commencement of Fall 2026-27 Semester",
           "DATES AND DAYS": "15 August 2026",
           "DETAILS AND REMARKS": "First Class Day"
         }
       },
       {
         "id": 2,
         "data": {
           "DESCRIPTION": "Independence Day",
           "DATES AND DAYS": "15 August 2026 (Saturday)",
           "DETAILS AND REMARKS": "Holiday - College Closed"
         }
       },
       {
         "id": 3,
         "data": {
           "DESCRIPTION": "Milad-un-Nabi",
           "DATES AND DAYS": "26 August 2026 (Wednesday)",
           "DETAILS AND REMARKS": "Holiday - College Closed"
         }
       },
       {
         "id": 4,
         "data": {
           "DESCRIPTION": "Vinayaka Chaturthi",
           "DATES AND DAYS": "14 September 2026 (Monday)",
           "DETAILS AND REMARKS": "Holiday - College Closed"
         }
       },
       {
         "id": 5,
         "data": {
           "DESCRIPTION": "Mahatma Gandhi Jayanti",
           "DATES AND DAYS": "2 October 2026 (Friday)",
           "DETAILS AND REMARKS": "Holiday - College Closed"
         }
       },
       {
         "id": 6,
         "data": {
           "DESCRIPTION": "Vijaya Dashami / Dussehra",
           "DATES AND DAYS": "20 October 2026 (Tuesday)",
           "DETAILS AND REMARKS": "Holiday - College Closed"
         }
       },
       {
         "id": 7,
         "data": {
           "DESCRIPTION": "Deepavali",
           "DATES AND DAYS": "7-10 November 2026",
           "DETAILS AND REMARKS": "Holiday - College Closed"
         }
       },
       {
         "id": 8,
         "data": {
           "DESCRIPTION": "Last Instructional Day of Fall Semester",
           "DATES AND DAYS": "14 November 2026",
           "DETAILS AND REMARKS": "End of classes"
         }
       }
     ]
   }'::jsonb
 )
 ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
