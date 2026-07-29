const fs = require('fs');
const path = require('path');

const srcPagesDir = path.join(__dirname, 'src', 'pages');

const replaceInFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it has loading text
    if (!content.includes('<div>Loading...</div>') && !content.includes('<p>Loading...</p>')) return;

    // Replace the loading text
    content = content.replace(/<div>Loading\.\.\.<\/div>/g, '<Loader size="large" />');
    content = content.replace(/<p>Loading\.\.\.<\/p>/g, '<Loader size="large" />');

    // Add import if not present
    if (!content.includes('import Loader from')) {
        // Calculate relative path to components
        const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'src', 'components', 'Loader'));
        const importPath = relativePath.replace(/\\/g, '/'); // ensure forward slashes
        
        // Find last import
        const importRegex = /^import.*?;?\s*$/gm;
        let lastMatch;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            lastMatch = match;
        }

        if (lastMatch) {
            const insertPos = lastMatch.index + lastMatch[0].length;
            content = content.slice(0, insertPos) + `\nimport Loader from '${importPath}';` + content.slice(insertPos);
        } else {
            content = `import Loader from '${importPath}';\n` + content;
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
};

const walk = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            replaceInFile(fullPath);
        }
    }
};

walk(srcPagesDir);
