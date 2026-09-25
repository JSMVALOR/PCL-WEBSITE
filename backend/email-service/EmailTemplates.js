const generateEmailWrapper = (title, content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; color: #1c1c1e; margin: 0; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05); }
        .header { background-color: #b91c1c; color: #ffffff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
        .header p { margin: 5px 0 0; font-size: 12px; font-weight: 600; letter-spacing: 2px; opacity: 0.8; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content h2 { color: #b91c1c; font-size: 20px; margin-top: 0; }
        .footer { background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 11px; color: #888; }
        .btn { display: inline-block; background-color: #b91c1c; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
        .highlight-box { background-color: #fcf5f5; border-left: 4px solid #b91c1c; padding: 15px; margin: 20px 0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Prudentia College of Law</h1>
            <p>Automated Alert System</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Prudentia College of Law. This is an automated system message. Please do not reply directly to this email.<br>
            Authorized by the Registrar's Office.
        </div>
    </div>
</body>
</html>
`;

module.exports = {
    // --- STUDENT MAILS ---
    attendanceWarningTemplate: (studentName, currentPercentage) => generateEmailWrapper(
        "Attendance Warning",
        `<h2>Attendance Deficit Alert</h2>
        <p>Dear ${studentName},</p>
        <p>This is an automated notification regarding your academic attendance. As per the Bar Council of India (BCI) mandate, a minimum of 75% attendance is required to be eligible for the end-semester examinations.</p>
        <div class="highlight-box">
            Current Attendance: <span style="color: #b91c1c; font-size: 18px;">${currentPercentage}%</span>
        </div>
        <p>Please ensure you attend your scheduled classes regularly to improve your standing. Failure to meet the mandate will result in exam debarment.</p>`
    ),
    
    feeReminderTemplate: (studentName, amount, dueDate, isOverdue = false) => generateEmailWrapper(
        isOverdue ? "Overdue Fee Alert" : "Fee Payment Reminder",
        `<h2>${isOverdue ? 'Overdue Fee Alert' : 'Fee Payment Reminder'}</h2>
        <p>Dear ${studentName},</p>
        <p>This is a reminder regarding your academic fee dues.</p>
        <div class="highlight-box">
            Amount Due: Rs. ${amount}<br>
            Due Date: ${dueDate}
        </div>
        <p>${isOverdue ? 'Your payment is now overdue. Please clear your dues immediately to avoid late penalties and restrictions on portal access.' : 'Please ensure the payment is made on or before the due date.'}</p>
        <a href="https://prudentiacollege.edu/login" class="btn">Pay Now via ERP</a>`
    ),

    libraryDuesTemplate: (studentName, bookTitle, dueDate) => generateEmailWrapper(
        "Library Overdue Alert",
        `<h2>Library Book Overdue</h2>
        <p>Dear ${studentName},</p>
        <p>Our records indicate that you have an overdue book from the PCL Central Library.</p>
        <div class="highlight-box">
            Book Title: ${bookTitle}<br>
            Due Date: ${dueDate}
        </div>
        <p>Please return the book immediately to the library desk to halt further accumulation of late fines.</p>`
    ),

    // --- PARENT MAILS ---
    absenteeAlertTemplate: (parentName, studentName, date) => generateEmailWrapper(
        "Urgent: Absentee Alert",
        `<h2>Student Absentee Alert</h2>
        <p>Dear ${parentName},</p>
        <p>This is to inform you that your ward, <strong>${studentName}</strong>, has been marked absent for the initial periods today (${date}) without any prior approved leave.</p>
        <div class="highlight-box">
            Status: ABSENT (Unexcused)<br>
            Date: ${date}
        </div>
        <p>We request you to kindly check with your ward or contact the college administration for clarification. Consistent absenteeism may affect examination eligibility.</p>`
    ),

    parentPerformanceReportTemplate: (parentName, studentName, month, attendance, remarks) => generateEmailWrapper(
        "Monthly Performance Report",
        `<h2>Monthly Academic Report</h2>
        <p>Dear ${parentName},</p>
        <p>Please find the performance summary for your ward, <strong>${studentName}</strong>, for the month of ${month}.</p>
        <div class="highlight-box">
            Monthly Attendance: ${attendance}%<br>
            Disciplinary/Academic Remarks: ${remarks || "Satisfactory"}
        </div>
        <p>You may log into the Parent Portal for a detailed breakdown of marks, attendance logs, and fee receipts.</p>
        <a href="https://prudentiacollege.edu/login" class="btn">Access Parent Portal</a>`
    ),

    // --- FACULTY MAILS ---
    timetableChangeTemplate: (facultyName, day, details) => generateEmailWrapper(
        "Timetable Alteration Alert",
        `<h2>Timetable Modification</h2>
        <p>Dear Prof. ${facultyName},</p>
        <p>Please be advised that there has been an administrative modification to your timetable for the upcoming week.</p>
        <div class="highlight-box">
            Affected Day: ${day}<br>
            Update Details: ${details}
        </div>
        <p>Please review your updated schedule on the Faculty Dashboard to ensure seamless academic delivery.</p>
        <a href="https://prudentiacollege.edu/login" class="btn">View Updated Timetable</a>`
    ),

    payrollDeficitWarningTemplate: (facultyName, loggedHours, requiredHours) => generateEmailWrapper(
        "Payroll Hours Deficit Warning",
        `<h2>Action Required: Logging Hours</h2>
        <p>Dear Prof. ${facultyName},</p>
        <p>This is an automated advisory from the Finance & HR Department. As we approach the end of the payroll cycle, your logged clock-in hours are currently reflecting a deficit.</p>
        <div class="highlight-box">
            Hours Logged: ${loggedHours} hrs<br>
            Minimum Requirement: ${requiredHours} hrs
        </div>
        <p>Please ensure that all your classes and biometric logs are synced and any missed manual punches are submitted for Admin approval before the 28th to avoid LOP (Loss of Pay) deductions.</p>`
    )
};
