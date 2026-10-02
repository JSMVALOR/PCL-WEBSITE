const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.devDependencies['@babel/cli'] = '^7.24.0';
pkg.devDependencies['@babel/core'] = '^7.24.0';
pkg.devDependencies['@babel/preset-react'] = '^7.24.0';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
