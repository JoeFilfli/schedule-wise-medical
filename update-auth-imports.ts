import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: ['node_modules/**', '.next/**', 'out/**']
});

files.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  if (content.includes('authConfig')) {
    const updatedContent = content.replace(/authConfig/g, 'authConfig');
    writeFileSync(file, updatedContent);
    console.log(`Updated ${file}`);
  }
}); 