const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '..', 'public');
const outputDir = path.resolve(__dirname, '..', 'dist');

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  fs.mkdirSync(dest, { recursive: true });

  entries.forEach((entry) => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

const rootOutputDir = path.resolve(__dirname, '..', '..', 'dist');

if (!fs.existsSync(sourceDir)) {
  console.error(`Source directory not found: ${sourceDir}`);
  process.exit(1);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.rmSync(rootOutputDir, { recursive: true, force: true });
copyRecursive(sourceDir, outputDir);
copyRecursive(sourceDir, rootOutputDir);
console.log(`Built static site to ${outputDir}`);
console.log(`Built static site to ${rootOutputDir}`);
