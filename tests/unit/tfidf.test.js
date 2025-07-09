// This file contains unit tests for the TfidfCalculator class, validating the correctness of TF-IDF calculations.

const { TfidfCalculator } = require('../../src/core/tfidf-calculator');
const { DocumentProcessor } = require('../../src/core/document-processor');

describe('TfidfCalculator', () => {
    let tfidfCalculator;
    let documents;

    beforeEach(() => {
        tfidfCalculator = new TfidfCalculator();
        documents = [
            "This is a sample document.",
            "This document is another example.",
            "And this is yet another document."
        ];
    });

    test('should calculate TF-IDF scores correctly', () => {
        const processedDocs = documents.map(doc => new DocumentProcessor().process(doc));
        const tfidfScores = tfidfCalculator.calculate(processedDocs);

        expect(tfidfScores).toBeDefined();
        expect(tfidfScores.length).toBe(processedDocs.length);
        expect(tfidfScores[0]).toHaveProperty('termScores');
    });

    test('should handle empty documents', () => {
        const processedDocs = [''];
        const tfidfScores = tfidfCalculator.calculate(processedDocs);

        expect(tfidfScores).toBeDefined();
        expect(tfidfScores.length).toBe(processedDocs.length);
        expect(tfidfScores[0].termScores).toEqual({});
    });

    test('should handle documents with no common terms', () => {
        const uniqueDocs = [
            "Unique document one.",
            "Another unique document."
        ];
        const processedDocs = uniqueDocs.map(doc => new DocumentProcessor().process(doc));
        const tfidfScores = tfidfCalculator.calculate(processedDocs);

        expect(tfidfScores).toBeDefined();
        expect(tfidfScores.length).toBe(processedDocs.length);
        expect(tfidfScores[0].termScores).toEqual(expect.any(Object));
        expect(tfidfScores[1].termScores).toEqual(expect.any(Object));
    });
});