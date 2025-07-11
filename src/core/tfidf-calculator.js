class TfidfCalculator {
    constructor(documents) {
        console.log('📊 TfidfCalculator初期化中...');
        this.documents = documents;
        this.termFrequencies = [];
        this.inverseDocumentFrequencies = {};
        this.tfidfScores = [];
        console.log(`📄 文書数: ${documents.length}`);
    }

    calculateTermFrequency() {
        console.log('🔢 項目頻度(TF)計算開始...');
        this.termFrequencies = this.documents.map((doc, index) => {
            console.log(`  文書${index + 1}/${this.documents.length}処理中...`);
            const termFrequency = {};
            const words = doc.split(/\s+/);
            const totalWords = words.length;

            words.forEach(word => {
                word = word.toLowerCase();
                termFrequency[word] = (termFrequency[word] || 0) + 1 / totalWords;
            });

            console.log(`    語彙数: ${Object.keys(termFrequency).length}`);
            return termFrequency;
        });
        console.log('✅ 項目頻度(TF)計算完了');
    }

    calculateInverseDocumentFrequency() {
        console.log('📉 逆文書頻度(IDF)計算開始...');
        const totalDocuments = this.documents.length;
        const documentFrequency = {};

        console.log('  文書頻度計算中...');
        this.documents.forEach((doc, index) => {
            if (index % 10 === 0) {
                console.log(`    進行状況: ${index + 1}/${totalDocuments}`);
            }
            const uniqueWords = new Set(doc.split(/\s+/).map(word => word.toLowerCase()));
            uniqueWords.forEach(word => {
                documentFrequency[word] = (documentFrequency[word] || 0) + 1;
            });
        });

        console.log('  IDF値計算中...');
        const totalUniqueWords = Object.keys(documentFrequency).length;
        let processedWords = 0;
        
        for (const word in documentFrequency) {
            this.inverseDocumentFrequencies[word] = Math.log(totalDocuments / documentFrequency[word]);
            processedWords++;
            
            if (processedWords % 10000 === 0) {
                console.log(`    進行状況: ${processedWords}/${totalUniqueWords}語`);
            }
        }
        
        console.log(`✅ 逆文書頻度(IDF)計算完了: ${totalUniqueWords}語`);
    }

    calculateTfidf() {
        console.log('🧮 TF-IDF計算開始...');
        this.calculateTermFrequency();
        this.calculateInverseDocumentFrequency();

        console.log('  TF-IDFスコア計算中...');
        this.tfidfScores = this.termFrequencies.map((termFrequency, index) => {
            console.log(`    文書${index + 1}/${this.termFrequencies.length}処理中...`);
            const tfidf = {};
            for (const word in termFrequency) {
                tfidf[word] = termFrequency[word] * this.inverseDocumentFrequencies[word];
            }
            return tfidf;
        });
        
        console.log('✅ TF-IDF計算完了');
    }

    getTfidfScores() {
        console.log('📊 TF-IDFスコア取得中...');
        this.calculateTfidf();
        return this.tfidfScores;
    }
}

module.exports = TfidfCalculator;