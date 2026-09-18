import { isBefore, isAfter, differenceInMinutes, parse, getDay, getDate } from 'date-fns';

export const FACULTY_ATTENDANCE_RULES = {
    GRACE_PERIOD_MINUTES: 10,
    
    // Check if today is a working day
    isWorkingDay: (date) => {
        const dayOfWeek = getDay(date); // 0 = Sun, 1 = Mon ... 6 = Sat
        
        // Sunday is always off
        if (dayOfWeek === 0) return false;
        
        // Monday-Friday are working days
        if (dayOfWeek >= 1 && dayOfWeek <= 5) return true;
        
        // Saturday logic (2nd and 4th are working)
        if (dayOfWeek === 6) {
            const dateOfMonth = getDate(date);
            const weekNumber = Math.ceil(dateOfMonth / 7);
            return (weekNumber === 2 || weekNumber === 4);
        }
        return false;
    },

    // Get exact working hours for a given date
    getWorkingHours: (date) => {
        const dayOfWeek = getDay(date);
        
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            return {
                start: '08:45',
                end: '16:45',
                totalMinutes: 8 * 60
            };
        } else if (dayOfWeek === 6) {
            return {
                start: '09:30',
                end: '13:00',
                totalMinutes: 3.5 * 60
            };
        }
        return null;
    },

    // Calculate exact minutes late (accounting for grace period)
    calculateLateMinutes: (date, clockInTimeStr) => {
        const rules = FACULTY_ATTENDANCE_RULES.getWorkingHours(date);
        if (!rules) return 0; // Not a working day
        
        const [clockInHours, clockInMins] = clockInTimeStr.split(':').map(Number);
        const [startHours, startMins] = rules.start.split(':').map(Number);
        
        const clockInDate = new Date();
        clockInDate.setHours(clockInHours, clockInMins, 0, 0);
        
        const expectedStartDate = new Date();
        expectedStartDate.setHours(startHours, startMins, 0, 0);
        
        const diff = differenceInMinutes(clockInDate, expectedStartDate);
        
        if (diff <= FACULTY_ATTENDANCE_RULES.GRACE_PERIOD_MINUTES) {
            return 0; // Within grace period
        }
        
        return diff; // Late by exact minutes
    },

    // Calculate exact minutes left early
    calculateEarlyLeaveMinutes: (date, clockOutTimeStr) => {
        const rules = FACULTY_ATTENDANCE_RULES.getWorkingHours(date);
        if (!rules) return 0;
        
        const [clockOutHours, clockOutMins] = clockOutTimeStr.split(':').map(Number);
        const [endHours, endMins] = rules.end.split(':').map(Number);
        
        const clockOutDate = new Date();
        clockOutDate.setHours(clockOutHours, clockOutMins, 0, 0);
        
        const expectedEndDate = new Date();
        expectedEndDate.setHours(endHours, endMins, 0, 0);
        
        const diff = differenceInMinutes(expectedEndDate, clockOutDate);
        
        return diff > 0 ? diff : 0;
    },

    // Formula to deduct exact salary based on minutes missed
    calculateLopDeduction: (baseSalary, totalMinutesMissedInMonth) => {
        const workingDaysInMonth = 22; // Approximation, can be dynamic
        const avgDailyMinutes = 8 * 60;
        const perMinuteRate = baseSalary / (workingDaysInMonth * avgDailyMinutes);
        
        return totalMinutesMissedInMonth * perMinuteRate;
    }
};
