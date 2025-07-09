// This file contains unit tests for the SimilaritySearch class, checking the accuracy of similarity comparisons.

const { SimilaritySearch } = require('../../src/core/similarity-search');
const { TfidfCalculator } = require('../../src/core/tfidf-calculator');

describe('SimilaritySearch', () => {
    let similaritySearch;
    let documents;

    beforeEach(() => {
        const tfidfCalculator = new TfidfCalculator();
        similaritySearch = new SimilaritySearch(tfidfCalculator);
        documents = [
            "The quick brown fox jumps over the lazy dog.",
            "Never gonna give you up, never gonna let you down.",
            "The rain in Spain stays mainly in the plain."
        ];
        tfidfCalculator.calculate(documents);
    });

    test('should calculate similarity between two documents', () => {
        const doc1 = documents[0];
        const doc2 = documents[1];
        const similarity = similaritySearch.calculateSimilarity(doc1, doc2);
        expect(similarity).toBeGreaterThan(0);
    });

    test('should return 0 similarity for completely different documents', () => {
        const doc1 = documents[0];
        const doc2 = documents[2];
        const similarity = similaritySearch.calculateSimilarity(doc1, doc2);
        expect(similarity).toBe(0);
    });

    test('should return 1 similarity for identical documents', () => {
        const doc1 = documents[0];
        const similarity = similaritySearch.calculateSimilarity(doc1, doc1);
        expect(similarity).toBe(1);
    });
});