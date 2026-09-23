const fs = require('fs');

const importsToAdd = `
import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
`;

function patchFile(filepath) {
    let c = fs.readFileSync(filepath, 'utf8');
    if (!c.includes('import HoldButton')) {
        c = c.replace(
            `import { useERP } from "../../../context/ErpContext";`,
            `import { useERP } from "../../../context/ErpContext";\n${importsToAdd}`
        );
        fs.writeFileSync(filepath, c);
        console.log("Patched imports in", filepath);
    }
}

patchFile('src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx');
patchFile('src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx');
