// This file contains unit tests for the TextTokenizer class, ensuring its methods work as expected.

const { TextTokenizer } = require('../../src/core/text-tokenizer');

describe('TextTokenizer', () => {
    let tokenizer;

    beforeEach(() => {
        tokenizer = new TextTokenizer();
    });

    test('should tokenize a simple sentence into words', () => {
        const text = 'This is a test.';
        const expectedTokens = ['this', 'is', 'a', 'test'];
        const tokens = tokenizer.tokenize(text);
        expect(tokens).toEqual(expectedTokens);
    });

    test('should handle punctuation correctly', () => {
        const text = 'Hello, world! This is a test.';
        const expectedTokens = ['hello', 'world', 'this', 'is', 'a', 'test'];
        const tokens = tokenizer.tokenize(text);
        expect(tokens).toEqual(expectedTokens);
    });

    test('should tokenize n-grams correctly', () => {
        const text = 'Tokenize this text into n-grams.';
        const expectedNgrams = ['tokenize this', 'this text', 'text into', 'into n-grams'];
        const ngrams = tokenizer.tokenizeNgrams(text, 2);
        expect(ngrams).toEqual(expectedNgrams);
    });

    test('should return an empty array for empty input', () => {
        const text = '';
        const expectedTokens = [];
        const tokens = tokenizer.tokenize(text);
        expect(tokens).toEqual(expectedTokens);
    });

    test('should ignore stopwords if configured', () => {
        tokenizer.setOptions({ ignoreStopwords: true });
        const text = 'This is a simple test.';
        const expectedTokens = ['simple', 'test'];
        const tokens = tokenizer.tokenize(text);
        expect(tokens).toEqual(expectedTokens);
    });
});