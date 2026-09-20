const icons = require('@hugeicons/core-free-icons');
console.log(Object.keys(icons).filter(k => k.toLowerCase().includes('cancel') || k.toLowerCase().includes('delete') || k.toLowerCase().includes('tick') || k.toLowerCase().includes('check')));
