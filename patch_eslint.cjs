const fs = require('fs');
let file = fs.readFileSync('.eslintrc.json', 'utf8');
let config = JSON.parse(file);

config.rules["react/no-unescaped-entities"] = "off";
config.rules["unused-imports/no-unused-vars"] = "off";
config.rules["no-empty"] = "off";
config.rules["no-constant-condition"] = "off";
config.rules["no-undef"] = "off"; // Too many false positives if globals aren't configured perfectly
config.rules["unused-imports/no-unused-imports"] = "off";

fs.writeFileSync('.eslintrc.json', JSON.stringify(config, null, 2));
