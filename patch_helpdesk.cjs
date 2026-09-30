const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/AdminHelpdesk/AdminHelpdesk.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Ensure email is fetched
content = content.replace(
    "select('*, profiles(full_name, role, erp_id)')",
    "select('*, profiles(full_name, role, erp_id, email)')"
);

// 2. Add EmailService import
if (!content.includes('sendSystemEmail')) {
    content = content.replace(
        "import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';",
        "import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';\nimport { sendSystemEmail } from '../../../lib/EmailService';"
    );
}

// 3. Add email hook in handleReply
const oldReply = `                    const noticeTitle = isClosing ? "Ticket Resolved" : "New Reply on Support Ticket";
                    const noticeContent = isClosing 
                        ? \`Your ticket (\${ticketData.ticket_id}) has been resolved and closed.\`
                        : \`Admin has replied to your ticket (\${ticketData.ticket_id}).\`;
                        
                    await supabase.from('notices').insert({
                        title: noticeTitle,
                        content: noticeContent,
                        target_audience: ['student'],
                        created_by: null,
                        is_public: false,
                        priority: 'normal'
                    });`;

const newReply = `                    const noticeTitle = isClosing ? "Ticket Resolved" : "New Reply on Support Ticket";
                    const noticeContent = isClosing 
                        ? \`Your ticket (\${ticketData.ticket_id}) has been resolved and closed.\`
                        : \`Admin has replied to your ticket (\${ticketData.ticket_id}).\`;
                        
                    await supabase.from('notices').insert({
                        title: noticeTitle,
                        content: noticeContent,
                        target_audience: [ticketData.profiles?.role || 'student'],
                        created_by: null,
                        is_public: false,
                        priority: 'normal'
                    });
                    
                    if (ticketData.profiles?.email) {
                        try {
                            await sendSystemEmail('TICKET_REPLY', {
                                to_email: ticketData.profiles.email,
                                ticket_id: ticketData.ticket_id,
                                student_name: ticketData.profiles.full_name || 'User',
                                reply_text: text || 'Your ticket has been marked as resolved.',
                                status: isClosing ? 'resolved' : 'replied'
                            });
                        } catch (emailErr) {
                            console.error("Email dispatch failed:", emailErr);
                        }
                    }`;

content = content.replace(oldReply, newReply);

fs.writeFileSync(file, content);
