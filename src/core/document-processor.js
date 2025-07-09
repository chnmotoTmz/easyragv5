class DocumentProcessor {
    constructor() {
        this.documents = [];
    }

    loadDocuments(documents) {
        this.documents = documents;
    }

    processDocuments() {
        this.documents = this.documents.map(doc => this.preprocess(doc));
    }

    preprocess(document) {
        // Implement preprocessing logic here (e.g., cleaning, tokenization)
        return document.trim(); // Placeholder for actual preprocessing
    }

    getDocuments() {
        return this.documents;
    }
}

module.exports = DocumentProcessor;