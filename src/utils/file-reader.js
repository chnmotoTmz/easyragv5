const fs = require('fs');

function readFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data;
    } catch (error) {
        console.error(`Error reading file from disk: ${error}`);
        return null;
    }
}

module.exports = { readFile };