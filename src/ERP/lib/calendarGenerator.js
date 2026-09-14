/* © 2026 JSM VALOR. All Rights Reserved. */
// src/lib/calendarGenerator.js
import { downloadFile } from "./pdfGenerator";

/**
 * Formats a Date object into ICS standard datetime format (YYYYMMDDTHHMMSSZ)
 */
const formatIcsDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Generates and downloads an .ics file from an array of events
 * events should look like: { title, description, location, startDate, endDate }
 */
export const generateCalendarICS = (filename, events) => {
    const header = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//PCL ERP//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH"
    ].join("\n");

    const body = events.map(event => {
        const uid = Math.random().toString(36).substring(2) + "@jsmerp.com";
        const dtStamp = formatIcsDate(new Date());
        const dtStart = formatIcsDate(event.startDate);
        const dtEnd = formatIcsDate(event.endDate);

        return [
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTAMP:${dtStamp}`,
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`,
            `SUMMARY:${event.title || 'Event'}`,
            `DESCRIPTION:${event.description || ''}`,
            `LOCATION:${event.location || ''}`,
            "END:VEVENT"
        ].join("\r\n"); // ICS format requires CRLF
    }).join("\r\n");

    const footer = "\nEND:VCALENDAR";

    const icsContent = `${header}\n${body}${footer}`;
    
    // Use the download file helper from pdfGenerator
    downloadFile(filename + ".ics", icsContent, "text/calendar;charset=utf-8");
};
