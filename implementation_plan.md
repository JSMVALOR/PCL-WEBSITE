# Revamp Course Vault Semester Logic & Progress Stats

The user wants the "Current", "Previous", and "All" tabs in the Course Vault to have very distinct behaviors, deeply tied to the ERP's actual data rather than just basic filtering.

## Proposed Changes

### 1. "Current" Tab Re-alignment
- Instead of relying on a hardcoded semester number in the user's profile, "Current" will strictly display the subjects that the admin has actively assigned to their batch in `cohort_subjects`.
- This ensures perfect sync with the Admin portal.

### 2. "All Semesters" Tab
- Will continue to display the entire master curriculum for their program, beautifully grouped by semester, with inactive subjects greyed out.

### 3. "Previous" Tab & Stats Integration
- Will filter to show subjects from semesters prior to their active one.
- **New Feature**: We will inject real academic analytics into the cards for these previous subjects. 
- We will fetch and calculate:
  - Overall Attendance % for that specific course
  - Completed Assignments count / Total Assignments
  - (Any other relevant grades if available)
- *Note: If a student is currently in Semester 1, the "Previous" tab will correctly remain empty.*

## Open Questions

> [!IMPORTANT]
> **Data History for Previous Semesters**
> Currently, the system calculates attendance and assignments based on the active `cohort_subjects`. For past semesters, do you want us to just pull historical attendance/assignments tied to those `master_subject_ids`, assuming the student was enrolled in them? 
> Or is there a specific archive table where past semester grades are locked in?

## Verification Plan
1. Ensure "Current" precisely matches the active admin cohort assignments.
2. Ensure "Previous" fetches and displays the new stats overlay successfully without crashing.
