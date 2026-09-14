/* © 2026 JSM VALOR. All Rights Reserved. */
/**
 * Calculates the relative semester of a student based on their academic_batch.
 * Assuming academic_batch is formatted like "2024-2029" or contains the start year.
 * Assuming academic year starts in August.
 * 
 * @param {string} batchString 
 * @returns {number | string}
 */
export function calculateRelativeSemester(batchString) {
    if (!batchString) return 'N/A';
    
    // Attempt to extract the starting year (e.g., from "2024-2029" or "Batch of 2024")
    const match = batchString.match(/\b(20\d{2})\b/);
    if (!match) return 'N/A';

    const startYear = parseInt(match[1], 10);
    // Academic years typically start in August
    const startDate = new Date(startYear, 7, 1); // August 1st of start year
    const currentDate = new Date();

    const monthsDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + (currentDate.getMonth() - startDate.getMonth());
    
    // Before August of their first year, they are in semester 1
    if (monthsDiff < 0) return 1;

    // Roughly 6 months per semester
    const semester = Math.floor(monthsDiff / 6) + 1;
    
    // Cap at typical 10 semesters (5 years) just in case
    return Math.min(semester, 10);
}
