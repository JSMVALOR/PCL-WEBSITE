const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'utf8');

const headlessSingle = `// HEADLESS NOTIFICATION TRIGGER
            if (status === 'absent') {
                // Find parent email mapped to this student
                const { data: mapping } = await supabase.from('parent_student_mappings').select('parent_id').eq('student_id', student.id).maybeSingle();
                if (mapping && mapping.parent_id) {
                    const { data: parent } = await supabase.from('profiles').select('email').eq('id', mapping.parent_id).single();
                    if (parent && parent.email) {
                        const studentObj = enrolledStudents.find(s => s.id === studentId);
                        sendSystemEmail('PARENT_ABSENT_ALERT', {
                            to_email: parent.email,
                            student_name: studentObj ? studentObj.full_name : 'Your Ward',
                            subject: activeSession.subject,
                            date: new Date().toLocaleDateString(),
                            portal_link: window.location.origin + '/login'
                        }).catch(e => console.error("Headless email failed", e));
                        
                        if (parent.phone) {
                            sendSystemWhatsApp(parent.phone, \`[ATTENDANCE ALERT] Dear Parent, \${studentObj ? studentObj.full_name : 'your ward'} has been marked ABSENT for \${activeSession.subject} on \${new Date().toLocaleDateString()}. Please check the Parent Portal.\`)
                            .catch(e => console.error("Headless WhatsApp failed", e));
                        }
                    }
                }
            }`;

const headlessSingleFixed = `// HEADLESS NOTIFICATION TRIGGER
            if (status === 'absent') {
                // Find parent email mapped to this student
                try {
                    const { data: mapping } = await supabase.from('parent_student_mappings').select('parent_id').eq('student_id', studentId).maybeSingle();
                    if (mapping && mapping.parent_id) {
                        const { data: parent } = await supabase.from('profiles').select('email, phone').eq('id', mapping.parent_id).single();
                        if (parent && parent.email) {
                            const studentObj = enrolledStudents.find(s => s.id === studentId);
                            sendSystemEmail('PARENT_ABSENT_ALERT', {
                                to_email: parent.email,
                                student_name: studentObj ? studentObj.full_name : 'Your Ward',
                                subject: activeSession.subject || 'Class',
                                date: new Date().toLocaleDateString(),
                                portal_link: window.location.origin + '/login'
                            }).catch(e => console.error("Headless email failed", e));
                            
                            if (parent.phone) {
                                sendSystemWhatsApp(parent.phone, \`[ATTENDANCE ALERT] Dear Parent, \${studentObj ? studentObj.full_name : 'your ward'} has been marked ABSENT for \${activeSession.subject || 'Class'} on \${new Date().toLocaleDateString()}. Please check the Parent Portal.\`)
                                .catch(e => console.error("Headless WhatsApp failed", e));
                            }
                        }
                    }
                } catch(e) {}
            }`;

// Replace ONLY the first occurrence (updateAttendance)
code = code.replace(headlessSingle, headlessSingleFixed);

const headlessBulk = `// HEADLESS NOTIFICATION TRIGGER
            if (status === 'absent') {
                // Find parent email mapped to this student
                const { data: mapping } = await supabase.from('parent_student_mappings').select('parent_id').eq('student_id', student.id).maybeSingle();
                if (mapping && mapping.parent_id) {
                    const { data: parent } = await supabase.from('profiles').select('email').eq('id', mapping.parent_id).single();
                    if (parent && parent.email) {
                        const studentObj = enrolledStudents.find(s => s.id === studentId);
                        sendSystemEmail('PARENT_ABSENT_ALERT', {
                            to_email: parent.email,
                            student_name: studentObj ? studentObj.full_name : 'Your Ward',
                            subject: activeSession.subject,
                            date: new Date().toLocaleDateString(),
                            portal_link: window.location.origin + '/login'
                        }).catch(e => console.error("Headless email failed", e));
                        
                        if (parent.phone) {
                            sendSystemWhatsApp(parent.phone, \`[ATTENDANCE ALERT] Dear Parent, \${studentObj ? studentObj.full_name : 'your ward'} has been marked ABSENT for \${activeSession.subject} on \${new Date().toLocaleDateString()}. Please check the Parent Portal.\`)
                            .catch(e => console.error("Headless WhatsApp failed", e));
                        }
                    }
                }
            }`;

const headlessBulkFixed = `// HEADLESS NOTIFICATION TRIGGER
            if (status === 'absent') {
                // Fire and forget for bulk
                for (const studentObj of filteredStudents) {
                    supabase.from('parent_student_mappings').select('parent_id').eq('student_id', studentObj.id).maybeSingle().then(({data: mapping}) => {
                        if (mapping && mapping.parent_id) {
                            supabase.from('profiles').select('email, phone').eq('id', mapping.parent_id).single().then(({data: parent}) => {
                                if (parent && parent.email) {
                                    sendSystemEmail('PARENT_ABSENT_ALERT', {
                                        to_email: parent.email,
                                        student_name: studentObj.full_name,
                                        subject: activeSession.subject || 'Class',
                                        date: new Date().toLocaleDateString(),
                                        portal_link: window.location.origin + '/login'
                                    }).catch(e => {});
                                    if (parent.phone) {
                                        sendSystemWhatsApp(parent.phone, \`[ATTENDANCE ALERT] Dear Parent, \${studentObj.full_name} has been marked ABSENT for \${activeSession.subject || 'Class'} on \${new Date().toLocaleDateString()}. Please check the Parent Portal.\`).catch(e => {});
                                    }
                                }
                            });
                        }
                    });
                }
            }`;

code = code.replace(headlessBulk, headlessBulkFixed);

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', code);
console.log('Fixed headless notifications in FacultyAttendance.jsx');
