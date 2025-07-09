class TextTokenizer {
    constructor() {
        this.stopwords = new Set(require('../data/stopwords').stopwords);
    }

    tokenize(text) {
        const cleanedText = this.preprocessText(text);
        return cleanedText.split(/\s+/).filter(token => !this.stopwords.has(token.toLowerCase()));
    }

    ngram(text, n) {
        const tokens = this.tokenize(text);
        const ngrams = [];

        for (let i = 0; i <= tokens.length - n; i++) {
            ngrams.push(tokens.slice(i, i + n).join(' '));
        }

        return ngrams;
    }

    preprocessText(text) {
        return text.replace(/[^\w\s]/g, '').toLowerCase().trim();
    }
}

module.exports = TextTokenizer;