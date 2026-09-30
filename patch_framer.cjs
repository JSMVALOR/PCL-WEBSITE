const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/ABOUT/FacultyProfile.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { motion } from 'framer-motion';",
  "import { motion, AnimatePresence } from 'framer-motion';"
);

fs.writeFileSync(file, content);
