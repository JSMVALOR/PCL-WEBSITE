const fs = require('fs');
const file = 'src/Shared/components/ReactBits/SwipeRow/SwipeRow.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace \${ with ${
content = content.replace(/\\\$\{/g, '${');

fs.writeFileSync(file, content);
console.log('Fixed SwipeRow completely!');
