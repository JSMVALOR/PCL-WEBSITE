const fs = require('fs');

function removeModalBlock(content) {
    const startIndex = content.indexOf('{showSuccessModal && (');
    if (startIndex === -1) return content;
    
    // We need to find the matching closing brace for this block.
    // However, it's easier to just do a string replacement if we know the approximate end, 
    // or we can count braces/parentheses.
    
    // The modal is usually at the very end of the component before the final closing tag.
    let count = 0;
    let endIndex = startIndex;
    let foundOpen = false;
    
    for (let i = startIndex; i < content.length; i++) {
        if (content[i] === '{') {
            count++;
            foundOpen = true;
        }
        else if (content[i] === '}') {
            count--;
        }
        
        if (foundOpen && count === 0) {
            endIndex = i + 1;
            break;
        }
    }
    
    return content.slice(0, startIndex) + content.slice(endIndex);
}

['Frontend/ERP/components/notices/EventsBoard.jsx', 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = removeModalBlock(content);
    fs.writeFileSync(file, content);
});

