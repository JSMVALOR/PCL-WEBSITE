const fs = require('fs');
const file = 'Website/components/NAVBAR/APPLY_NOW/ApplyNow.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
`      const { error } = await supabase.from('admissions_applications').insert([{
        name: formData.name, email: formData.email, phone: formData.phone,
        program: formData.program, family_in_legal: formData.familyInLegal,
        family_in_legal_who: combinedFamilyInLegalWho, marks_10th: formData.marks10th,
        marks_inter: formData.marksInter, exam_tglawcet: formData.examTGLAWCET,
        exam_clat: formData.examCLAT, exam_other: formData.examOther,
        status: 'pending', source: 'website'
      }]);

      await supabase.from('helpdesk_tickets').insert([{
        ticket_id: ticketId, category: 'Admissions', subject: \`Admission App: \${formData.name}\`,
        description: \`Name: \${formData.name}
Email: \${formData.email}
Phone: \${formData.phone}
Program: \${formData.program}
10th: \${formData.marks10th}, 12th: \${formData.marksInter}\`,
        status: 'open', admin_reply: 'Application Received', user_id: null
      }]);`,
`      const { error, data } = await supabase.from('admissions_applications').insert([{
        name: formData.name, email: formData.email, phone: formData.phone,
        program: formData.program, family_in_legal: formData.familyInLegal,
        family_in_legal_who: combinedFamilyInLegalWho, marks_10th: formData.marks10th,
        marks_inter: formData.marksInter, exam_tglawcet: formData.examTGLAWCET,
        exam_clat: formData.examCLAT, exam_other: formData.examOther,
        status: 'pending', source: 'website'
      }]);
      
      if (error) {
        console.error("Admissions Insert Error:", error);
        throw new Error("Failed to insert into admissions_applications: " + error.message);
      }

      try {
        const { error: ticketError } = await supabase.from('helpdesk_tickets').insert([{
          ticket_id: ticketId, category: 'Admissions', subject: \`Admission App: \${formData.name}\`,
          description: \`Name: \${formData.name}\\nEmail: \${formData.email}\\nPhone: \${formData.phone}\\nProgram: \${formData.program}\\n10th: \${formData.marks10th}, 12th: \${formData.marksInter}\`,
          status: 'open', admin_reply: 'Application Received', user_id: null
        }]);
        if (ticketError) console.warn("Helpdesk Ticket Insert Error:", ticketError);
      } catch (err) {
        console.warn("Helpdesk Ticket try-catch Error:", err);
      }`
);

content = content.replace(
`      if (error) throw error;
      setGeneratedTicket(ticketId);`,
`      setGeneratedTicket(ticketId);`
);

content = content.replace(
`    } catch (err) {
      setErrorMsg("Failed to submit application. Please try again.");
    }`,
`    } catch (err) {
      console.error("Application Submit Caught Error:", err);
      setErrorMsg(err.message || "Failed to submit application. Please try again.");
    }`
);

fs.writeFileSync(file, content);
console.log('done');
