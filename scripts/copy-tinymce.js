const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

const srcDir = path.join(__dirname, '..', 'node_modules', 'tinymce');
const destDir = path.join(__dirname, '..', 'public', 'tinymce');

console.log('--- TinyMCE Asset Sync ---');
console.log(`Source: ${srcDir}`);
console.log(`Destination: ${destDir}`);

if (fs.existsSync(srcDir)) {
    try {
        // Clean target directory if it exists
        if (fs.existsSync(destDir)) {
            fs.rmSync(destDir, { recursive: true, force: true });
        }
        
        console.log('Copying assets recursively...');
        copyDir(srcDir, destDir);
        console.log('TinyMCE assets synchronized successfully!');
    } catch (err) {
        console.error('Failed to copy TinyMCE assets:', err);
        process.exit(1);
    }
} else {
    console.error('Error: node_modules/tinymce does not exist. Please run npm install first.');
    process.exit(1);
}
