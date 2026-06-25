const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src/environments/environment.prod.ts');

const apiUrl = process.env.API_URL || process.env.VITE_API_BASE_URL || 'http://localhost:5000';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

const envConfigFile = `// Generated at build time by set-env.js
export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  frontendUrl: '${frontendUrl}',
  stripePublishableKey: 'pk_test_TYooMQauvdEDq54NiTphI7jx',
  sessionTtlMs: 28800000 // 8 hours in ms
};
`;

console.log('Generating environment.prod.ts dynamically...');
console.log(`apiUrl: ${apiUrl}`);
console.log(`frontendUrl: ${frontendUrl}`);

fs.writeFileSync(targetPath, envConfigFile, 'utf8');
console.log('environment.prod.ts generated successfully!');
