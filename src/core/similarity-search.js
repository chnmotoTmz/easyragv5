class SimilaritySearch {
    constructor(tfidfCalculator) {
        this.tfidfCalculator = tfidfCalculator;
    }

    calculateCosineSimilarity(vectorA, vectorB) {
        const dotProduct = vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
        const magnitudeA = Math.sqrt(vectorA.reduce((sum, value) => sum + value * value, 0));
        const magnitudeB = Math.sqrt(vectorB.reduce((sum, value) => sum + value * value, 0));

        if (magnitudeA === 0 || magnitudeB === 0) return 0;
        return dotProduct / (magnitudeA * magnitudeB);
    }

    findSimilarDocuments(queryDocument, documents) {
        const queryVector = this.tfidfCalculator.calculateTFIDF(queryDocument);
        const similarities = documents.map(doc => {
            const docVector = this.tfidfCalculator.calculateTFIDF(doc);
            const similarity = this.calculateCosineSimilarity(queryVector, docVector);
            return { document: doc, similarity };
        });

        return similarities.sort((a, b) => b.similarity - a.similarity);
    }
}

module.exports = SimilaritySearch;