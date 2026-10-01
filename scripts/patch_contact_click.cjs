const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/CONTACT/Contact.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the motion.div containing the iframe to include an overlay
const search = `<iframe \n              src="https://maps.google.com/maps?q=Prudentia%20College%20of%20Law,%20Gurramguda,%20Hyderabad&t=&z=15&ie=UTF8&iwloc=&output=embed" \n              className="w-full h-full rounded-[2rem] border border-[var(--card-border)] grayscale-[0.8] opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 pointer-events-none" \n              allowFullScreen="" \n              loading="lazy" \n              referrerPolicy="no-referrer-when-downgrade"\n            ></iframe>`;

// Actually I will just replace using regex
content = content.replace(/<iframe[\s\S]*?<\/iframe>/, `<a href="https://maps.app.goo.gl/B9U1Gv7nJ21c97Nf8" target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10 cursor-pointer rounded-[2rem]" aria-label="Open in Google Maps"></a>\n            $&`);

fs.writeFileSync(file, content);
