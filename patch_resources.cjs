const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    /r => r\.subject_id === selectedCourse\.id/g,
    'r => r.cohort_subject_id === selectedCourse.id'
);

c = c.replace(
    `setResources([data[0], ...resources]);
            setFormData({ title: "", url: "", type: "Drive Link" });
            setShowResourceForm(false);`,
    `setResources([data[0], ...resources]);
            setFormData({ title: "", url: "", type: "Drive Link" });
            setShowResourceForm(false);
            if (window.erpDialog) {
                window.erpDialog.alert("Resource added successfully.");
            }`
);

fs.writeFileSync(p, c);
console.log("Resources UI bug patched");
