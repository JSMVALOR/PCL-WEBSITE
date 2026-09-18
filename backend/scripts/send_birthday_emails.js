import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Mock email client - To be replaced with SendGrid/Resend when client provides API keys
const sendEmail = async (to, subject, html) => {
    console.log(`\n[EMAIL DISPATCH] -------------------------`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY: ${html}`);
    console.log(`------------------------------------------\n`);
    return true;
};

async function runBirthdayCron() {
    console.log('🎉 Starting Automated Birthday Dispatcher...');
    
    // Fallback to anon key if service_role is not available (since this is a mock script)
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
    
    if (supabaseUrl === 'YOUR_SUPABASE_URL') {
        console.warn('Supabase credentials not found. Please run this script with correct ENV vars.');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    console.log(`📅 Checking for birthdays on Month: ${currentMonth}, Day: ${currentDay}`);

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, dob')
        .not('dob', 'is', null);

    if (error) {
        console.error('Failed to fetch profiles:', error);
        return;
    }

    const birthdayUsers = profiles.filter(p => {
        if (!p.dob) return false;
        const d = new Date(p.dob);
        return d.getMonth() + 1 === currentMonth && d.getDate() === currentDay;
    });

    console.log(`Found ${birthdayUsers.length} birthdays today!\n`);

    for (const user of birthdayUsers) {
        const subject = `Happy Birthday from Prudentia College of Law! 🎉`;
        const html = `
            <h3>Dear ${user.full_name},</h3>
            <p>On behalf of the entire faculty and administration at Prudentia College of Law, we want to wish you a very Happy Birthday!</p>
            <p>May this year bring you immense success, joy, and academic excellence.</p>
            <br/>
            <p>Warm Regards,</p>
            <p><strong>Administration, PCL</strong></p>
        `;

        await sendEmail(user.email || `${user.full_name.replace(' ', '.').toLowerCase()}@example.com`, subject, html);
    }
    
    console.log('✅ Automated Birthday Dispatcher finished successfully.');
}

runBirthdayCron();
