// This file contains integration tests that validate the overall search functionality of the RAG system.

const { DocumentProcessor } = require('../../src/core/document-processor');
const { TfidfCalculator } = require('../../src/core/tfidf-calculator');
const { SimilaritySearch } = require('../../src/core/similarity-search');
const { readFile } = require('../../src/utils/file-reader');
const { preprocessText } = require('../../src/utils/text-preprocessor');
const sampleDocuments = require('../../src/data/sample-documents');

describe('Integration Tests for Search Functionality', () => {
    let documentProcessor;
    let tfidfCalculator;
    let similaritySearch;

    beforeAll(() => {
        documentProcessor = new DocumentProcessor();
        tfidfCalculator = new TfidfCalculator();
        similaritySearch = new SimilaritySearch();
    });

    test('should process documents and return search results', () => {
        const documents = sampleDocuments.map(doc => preprocessText(doc));
        documentProcessor.loadDocuments(documents);
        
        const tfidfScores = tfidfCalculator.calculateTFIDF(documentProcessor.getDocuments());
        const query = 'sample search text';
        const results = similaritySearch.search(query, tfidfScores);

        expect(results).toBeDefined();
        expect(results.length).toBeGreaterThan(0);
    });

    test('should return relevant documents for a given query', () => {
        const documents = sampleDocuments.map(doc => preprocessText(doc));
        documentProcessor.loadDocuments(documents);
        
        const tfidfScores = tfidfCalculator.calculateTFIDF(documentProcessor.getDocuments());
        const query = 'another search term';
        const results = similaritySearch.search(query, tfidfScores);

        expect(results).toBeDefined();
        expect(results.length).toBeGreaterThan(0);
        results.forEach(result => {
            expect(result.text).toMatch(new RegExp(query, 'i'));
        });
    });
});