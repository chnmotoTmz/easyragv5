class TfidfCalculator {
    constructor(documents) {
        this.documents = documents;
        this.termFrequencies = [];
        this.inverseDocumentFrequencies = {};
        this.tfidfScores = [];
    }

    calculateTermFrequency() {
        this.termFrequencies = this.documents.map(doc => {
            const termFrequency = {};
            const words = doc.split(/\s+/);
            const totalWords = words.length;

            words.forEach(word => {
                word = word.toLowerCase();
                termFrequency[word] = (termFrequency[word] || 0) + 1 / totalWords;
            });

            return termFrequency;
        });
    }

    calculateInverseDocumentFrequency() {
        const totalDocuments = this.documents.length;
        const documentFrequency = {};

        this.documents.forEach(doc => {
            const uniqueWords = new Set(doc.split(/\s+/).map(word => word.toLowerCase()));
            uniqueWords.forEach(word => {
                documentFrequency[word] = (documentFrequency[word] || 0) + 1;
            });
        });

        for (const word in documentFrequency) {
            this.inverseDocumentFrequencies[word] = Math.log(totalDocuments / documentFrequency[word]);
        }
    }

    calculateTfidf() {
        this.calculateTermFrequency();
        this.calculateInverseDocumentFrequency();

        this.tfidfScores = this.termFrequencies.map(termFrequency => {
            const tfidf = {};
            for (const word in termFrequency) {
                tfidf[word] = termFrequency[word] * this.inverseDocumentFrequencies[word];
            }
            return tfidf;
        });
    }

    getTfidfScores() {
        this.calculateTfidf();
        return this.tfidfScores;
    }
}

module.exports = TfidfCalculator;