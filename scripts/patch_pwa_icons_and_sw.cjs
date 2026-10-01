const fs = require('fs');
let file = fs.readFileSync('vite.config.js', 'utf8');

// Replace icon entries to use the new pwa-icon.svg
file = file.replace(
  /icons: \[\s*\{\s*src: '\/favicon\.svg',\s*sizes: '192x192',\s*type: 'image\/svg\+xml'\s*\},\s*\{\s*src: '\/favicon\.svg',\s*sizes: '512x512',\s*type: 'image\/svg\+xml'\s*\}/s,
  `icons: [
          {
            src: '/pwa-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/pwa-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/pwa-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }`
);

// Add skipWaiting + clientsClaim to workbox config for instant cache refresh
file = file.replace(
  /workbox: \{\s*cleanupOutdatedCaches: true,/,
  `workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,`
);

fs.writeFileSync('vite.config.js', file);
console.log('Done');
