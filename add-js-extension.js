import fs from 'fs';
import path from 'path';

const directoryPath = path.join(process.cwd(), 'build');

function addJsExtension(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/from\s*['"](.*)['"]/g, (match, p1) => {
    // Если путь содержит '/', то добавляем .js в конце
    if (p1.includes('/') && !p1.endsWith('.js')) {
      return `from '${p1}.js'`;
    }
    return match;
  });
  fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js')) {
      addJsExtension(fullPath);
    }
  });
}

processDirectory(directoryPath);
