import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dest = path.join(__dirname, 'homepage_export');

if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
}
fs.mkdirSync(dest, { recursive: true });

const foldersToCreate = [
    'src/pages',
    'src/components',
    'src/context',
    'src/lib'
];

foldersToCreate.forEach(folder => {
    fs.mkdirSync(path.join(dest, folder), { recursive: true });
});

const filesToCopy = [
    { src: 'src/pages/HomePage.jsx', dest: 'src/pages/HomePage.jsx' },
    { src: 'src/context/LanguageContext.jsx', dest: 'src/context/LanguageContext.jsx' },
    { src: 'src/lib/translations.js', dest: 'src/lib/translations.js' },
    { src: 'src/index.css', dest: 'src/index.css' },
    { src: 'package.json', dest: 'package.json' },
    { src: 'vite.config.js', dest: 'vite.config.js' }
];

filesToCopy.forEach(({ src, dest: destPath }) => {
    const srcFile = path.join(__dirname, src);
    if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, path.join(dest, destPath));
    }
});

// Copy components directory
const componentsSrc = path.join(__dirname, 'src/components');
if (fs.existsSync(componentsSrc)) {
    fs.cpSync(componentsSrc, path.join(dest, 'src/components'), { recursive: true });
}

console.log('Successfully exported HomePage and its dependencies to: ' + dest);
