const fs = require('fs');
const file = 'Frontend/ERP/components/shared/WeeklyChart.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/onSlotClick, batchName = '' \}?\) \{/, 'onSlotClick, batchName = \'\', onSlotSwap }) {');

content = content.replace(
    /onClick=\{\(\) => \{\s*if \(isDrawMode && onSlotClick\) \{\s*onSlotClick\(day, slot\.start, slot\.end\);\s*\}\s*\}\}/, 
    `onClick={() => {
        if (isDrawMode && onSlotClick) {
            onSlotClick(day, slot.start, slot.end);
        }
    }}
    onDragOver={(e) => {
        if (onSlotSwap) e.preventDefault();
    }}
    onDrop={(e) => {
        if (!onSlotSwap) return;
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId) {
            onSlotSwap(draggedId, day, slot.start, slot.end);
        }
    }}`
);

content = content.replace(
    /<div \s*onClick=\{\(e\) => \{\s*if \(onLectureClick\) \{\s*e\.stopPropagation\(\);\s*onLectureClick\(cls\);\s*\}\s*\}\}\s*className=\{`h-full rounded-xl/g, 
    `<div 
        draggable={!!onSlotSwap}
        onDragStart={(e) => {
            if (onSlotSwap) {
                e.dataTransfer.setData('text/plain', cls.id || (cls.raw && cls.raw.id) || '');
                e.dataTransfer.effectAllowed = 'move';
            }
        }}
        onClick={(e) => {
            if (onLectureClick) {
                e.stopPropagation();
                onLectureClick(cls);
            }
        }}
        className={\`h-full rounded-xl cursor-grab active:cursor-grabbing`
);

content = content.replace(
    /!isDrawMode \? 'cursor-pointer hover:scale-\[1\.02\] transition-transform shadow-sm' : ''/g,
    "!isDrawMode && !onSlotSwap ? 'cursor-pointer hover:scale-[1.02] transition-transform shadow-sm' : 'hover:scale-[1.02] transition-transform shadow-sm'"
);

fs.writeFileSync(file, content);
