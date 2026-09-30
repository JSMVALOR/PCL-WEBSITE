import { supabase } from '../lib/supabase/supabaseClient';

export const downloadUserData = async (userSession) => {
    if (!userSession?.db_id) return { success: false, message: 'No active session' };
    
    const userId = userSession.db_id;
    const isFaculty = userSession.role === 'faculty';
    const isStudent = userSession.role === 'student';

    try {
        const exportData = {
            metadata: {
                exported_at: new Date().toISOString(),
                user_id: userId,
                role: userSession.role,
                version: '1.0'
            },
            profile: null,
            mentorship: null,
            messages: [],
            leaves: [],
            notifications: [],
            size_bytes: 0
        };

        // 1. Profile
        const { data: profile, error: err_profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (err_profile && err_profile.code !== 'PGRST116') throw err_profile; // Ignore 0 rows returned error
        exportData.profile = profile;

        // 2. Mentorship Relations
        if (isFaculty) {
            const { data: mentees, error: err_mentees } = await supabase.from('mentorship').select('*').eq('faculty_id', userId);
        if (err_mentees && err_mentees.code !== 'PGRST116') throw err_mentees; // Ignore 0 rows returned error
            exportData.mentorship = { type: 'faculty', mentees: mentees || [] };
        } else if (isStudent) {
            const { data: mentor, error: err_mentor } = await supabase.from('mentorship').select('*').eq('student_id', userId).single();
        if (err_mentor && err_mentor.code !== 'PGRST116') throw err_mentor; // Ignore 0 rows returned error
            exportData.mentorship = { type: 'student', mentor: mentor || null };
        }

        // 3. Messages
        const { data: msgsSent, error: err_msgsSent } = await supabase.from('mentorship_messages').select('*').eq('sender_id', userId);
        if (err_msgsSent && err_msgsSent.code !== 'PGRST116') throw err_msgsSent; // Ignore 0 rows returned error
        const { data: msgsRecv, error: err_msgsRecv } = await supabase.from('mentorship_messages').select('*').eq('receiver_id', userId);
        if (err_msgsRecv && err_msgsRecv.code !== 'PGRST116') throw err_msgsRecv; // Ignore 0 rows returned error
        exportData.messages = [...(msgsSent || []), ...(msgsRecv || [])];

        // 4. Leaves
        if (isStudent) {
            const { data: leaves, error: err_leaves } = await supabase.from('leave_requests').select('*').eq('student_id', userId);
        if (err_leaves && err_leaves.code !== 'PGRST116') throw err_leaves; // Ignore 0 rows returned error
            exportData.leaves = leaves || [];
        } else if (isFaculty) {
            const { data: leaves, error: err_leaves } = await supabase.from('faculty_leaves').select('*').eq('faculty_id', userId);
        if (err_leaves && err_leaves.code !== 'PGRST116') throw err_leaves; // Ignore 0 rows returned error
            exportData.leaves = leaves || [];
        }

        // 5. Notifications
        const { data: notifs, error: err_notifs } = await supabase.from('notifications').select('*').eq('recipient_id', userId);
        if (err_notifs && err_notifs.code !== 'PGRST116') throw err_notifs; // Ignore 0 rows returned error
        exportData.notifications = notifs || [];

        // Compile and check size
        const jsonString = JSON.stringify(exportData, null, 2);
        const sizeInBytes = new Blob([jsonString]).size;
        
        // Soft enforce 2MB limit warning (2MB = 2097152 bytes)
        const isOverLimit = sizeInBytes > 2097152;
        exportData.size_bytes = sizeInBytes;

        // Trigger Download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pcl_erp_data_export_${userSession.id}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return { success: true, size: sizeInBytes, isOverLimit };
    } catch (err) {
        console.error('Data export failed:', err);
        return { success: false, message: err.message };
    }
};
