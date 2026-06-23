const fs = require('fs');
const path = require('path');

const folders = [
  'booking-calendar',
  'contract-viewer',
  'file-upload',
  'intake-form',
  'payment-form',
  'completion-screen'
];

folders.forEach(folder => {
  const file = path.join('src/app/pages/client-portal', folder, `${folder}.component.ts`);
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/..\/..\/..\/..\/services\/onboarding.service/g, '../../../services/onboarding.service');
  content = content.replace(/..\/..\/..\/..\/..\/environments\/environment/g, '../../../../environments/environment');
  
  // Also completion-screen uses sessionData().agency which is fine.
  
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
