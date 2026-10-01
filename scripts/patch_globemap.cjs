const fs = require('fs');
let file = 'Frontend/Website/components/UI/GlobeMap.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add a transparent overlay to capture clicks and completely block map interaction
const searchMap = '<MapContainer';
const overlay = `<div className="absolute inset-0 z-50 cursor-pointer" onClick={openGoogleMaps} aria-label="Open in Google Maps"></div>\n        <MapContainer`;

content = content.replace(searchMap, overlay);

// Also remove `pointer-events-none` from the popup text so it's not confusing, actually it doesn't matter since the overlay covers everything.

fs.writeFileSync(file, content);
