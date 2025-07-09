// This file demonstrates how to process multiple documents in a batch using the RAG CLI system.

const { DocumentProcessor } = require('../src/core/document-processor');
const { readFile } = require('../src/utils/file-reader');

async function processBatch(files) {
    const processor = new DocumentProcessor();

    for (const file of files) {
        try {
            const content = await readFile(file);
            processor.addDocument(content);
        } catch (error) {
            console.error(`Error reading file ${file}:`, error);
        }
    }

    const results = processor.processDocuments();
    console.log('Batch processing results:', results);
}

// Example usage: processBatch(['path/to/document1.txt', 'path/to/document2.txt']);
const filesToProcess = process.argv.slice(2);
if (filesToProcess.length === 0) {
    console.error('Please provide file paths as arguments.');
} else {
    processBatch(filesToProcess);
}