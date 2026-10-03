-- Upsert website Academic Calendar Grid to system_settings
INSERT INTO system_settings (key, value)
VALUES (
  'academic_calendar_grid',
  '{
    "columns": ["S. No.", "Academic Activity", "Date / Period", "Details / Remarks"],
    "rows": [
      {
        "id": 1,
        "data": {
          "S. No.": "1",
          "Academic Activity": "Commencement of Classes",
          "Date / Period": "17.08.2026",
          "Details / Remarks": "First Class Day"
        }
      },
      {
        "id": 2,
        "data": {
          "S. No.": "2",
          "Academic Activity": "Last Date of Re-admission",
          "Date / Period": "01.09.2026",
          "Details / Remarks": "-"
        }
      },
      {
        "id": 3,
        "data": {
          "S. No.": "3",
          "Academic Activity": "First Internal Examinations",
          "Date / Period": "12.10.2026 - 17.10.2026",
          "Details / Remarks": "-"
        }
      },
      {
        "id": 4,
        "data": {
          "S. No.": "4",
          "Academic Activity": "Short Vacation - Dussehra",
          "Date / Period": "19.10.2026 - 24.10.2026",
          "Details / Remarks": "Holiday - College Closed"
        }
      },
      {
        "id": 5,
        "data": {
          "S. No.": "5",
          "Academic Activity": "Reopening Day",
          "Date / Period": "26.10.2026",
          "Details / Remarks": "-"
        }
      },
      {
        "id": 6,
        "data": {
          "S. No.": "6",
          "Academic Activity": "Second Internal Examinations",
          "Date / Period": "16.11.2026 - 21.11.2026",
          "Details / Remarks": "-"
        }
      },
      {
        "id": 7,
        "data": {
          "S. No.": "7",
          "Academic Activity": "Last Date of Instructions",
          "Date / Period": "11.12.2026",
          "Details / Remarks": "End of classes"
        }
      },
      {
        "id": 8,
        "data": {
          "S. No.": "8",
          "Academic Activity": "Commencement of Semester-End Examinations",
          "Date / Period": "21.12.2026",
          "Details / Remarks": "-"
        }
      }
    ]
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
