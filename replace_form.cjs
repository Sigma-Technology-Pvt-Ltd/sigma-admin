const fs = require('fs');
const path = require('path');

const srcPagesDir = path.join(__dirname, 'src', 'pages');

const replaceInFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('<form ') || content.includes('<LoadingOverlay')) return;

    const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'src', 'components', 'LoadingOverlay'));
    const importPath = relativePath.replace(/\\/g, '/');
    
    const importRegex = /^import.*?;?\s*$/gm;
    let lastMatch;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        lastMatch = match;
    }

    if (lastMatch) {
        const insertPos = lastMatch.index + lastMatch[0].length;
        content = content.slice(0, insertPos) + `\nimport LoadingOverlay from '${importPath}';` + content.slice(insertPos);
    }

    content = content.replace(/<form([\s\S]*?)<\/form>/, 
        '<LoadingOverlay loading={loading}>\n            <form$1</form>\n        </LoadingOverlay>'
    );

    content = content.replace(/\{loading \? (?:<Loader size="small" \/>|'Saving\.\.\.') : ('Save [^']+')\}/g, '$1');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
};

const walk = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('Form.jsx')) {
            replaceInFile(fullPath);
        }
    }
};

walk(srcPagesDir);
