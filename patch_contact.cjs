const fs = require('fs');
const file = 'Frontend/Website/components/NAVBAR/CONTACT/Contact.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the bad pb link with a standard output=embed link
content = content.replace(
  'src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m3!1d3808.887295777321!2d78.5367!3d17.3195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDE5JzEwLjIiTiA3OMKwMzInMTIuMSJF!5e0!3m2!1sen!2sin!4v1699999999999!5m2!1sen!2sin"',
  'src="https://maps.google.com/maps?q=Prudentia%20College%20of%20Law,%20Gurramguda,%20Hyderabad&t=&z=15&ie=UTF8&iwloc=&output=embed"'
);

// Remove the `invert contrast-125` classes so the map doesn't turn black in the light theme
content = content.replace(
  'className="w-full h-full rounded-[2rem] border border-[var(--card-border)] grayscale invert contrast-125 opacity-90 hover:grayscale-0 hover:invert-0 hover:opacity-100 transition-all duration-1000"',
  'className="w-full h-full rounded-[2rem] border border-[var(--card-border)] grayscale-[0.8] opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-1000"'
);

fs.writeFileSync(file, content);
