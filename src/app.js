#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ========== ストップワード定義 ==========
const STOPWORDS_JP = new Set([
    'の', 'に', 'は', 'を', 'が', 'で', 'て', 'と', 'だ', 'である', 'です', 'ます',
    'から', 'まで', 'より', 'など', 'また', 'ただし', 'しかし', 'そして', 'それ', 'これ'
]);

const STOPWORDS_EN = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did'
]);

// CLI引数処理
function handleInput(args) {
    if (args.length === 0) {
        showHelp();
        return;
    }

    const command = args[0];
    
    switch (command) {
        case 'search':
            if (args.length < 3) {
                console.error('使用方法: node src/app.js search <ファイルパス> <クエリ> [件数]');
                return;
            }
            performSearch(args[1], args[2], 'tfidf_ultra', parseInt(args[3]) || 5);
            break;
        case 'help':
        case '--help':
        case '-h':
            showHelp();
            break;
        default:
            console.error(`未知のコマンド: ${command}`);
            showHelp();
    }
}

// ヘルプ表示
function showHelp() {
    console.log('🔍 RAG CLI System - 高精度文書検索システム');
    console.log('');
    console.log('使用方法:');
    console.log('  node src/app.js search <ファイルパス> <クエリ> [件数]');
    console.log('');
    console.log('パラメータ:');
    console.log('  ファイルパス  - 検索対象の文書ファイル');
    console.log('  クエリ        - 検索したい文字列');
    console.log('  件数          - 表示する検索結果の数（デフォルト: 5）');
    console.log('');
    console.log('コマンド:');
    console.log('  search    - TF-IDF（Ultra）アルゴリズムで文書検索を実行');
    console.log('  help      - このヘルプを表示');
    console.log('');
    console.log('例:');
    console.log('  node src/app.js search data.txt "Python機械学習" 5');
    console.log('  node src/app.js search ../data.txt "ライブラリを用いたPython"');
}

// ========== 前処理関数 ==========
function preprocessTextAdvanced(text) {
    return text.replace(/[^a-zA-Z0-9ぁ-んァ-ヶヷ-ヺー一-龥、。！？\s.,!?]/g, '')
               .replace(/\s+/g, ' ')
               .trim();
}

// ========== トークン化関数 ==========
function getTokensAdvanced(text, options = {}) {
    const {
        useStopwords = true,
        katakanaWeight = 1.5,
        englishWeight = 1.2
    } = options;
    
    const clean = preprocessTextAdvanced(text);
    const tokens = [];
    
    // 英単語（ストップワード除去オプション）
    const englishWords = clean.match(/\b[a-zA-Z]{2,}\b/g) || [];
    englishWords.forEach(word => {
        const lower = word.toLowerCase();
        if (!useStopwords || !STOPWORDS_EN.has(lower)) {
            // 英語重み適用
            for (let i = 0; i < Math.round(englishWeight); i++) {
                tokens.push(lower);
            }
        }
    });
    
    // 数字（年号、バージョン等重要）
    const numbers = clean.match(/\d+/g) || [];
    tokens.push(...numbers);
    
    // カタカナ語（技術用語として重要度高）
    const katakanaWords = clean.match(/[ァ-ヶー]{2,}/g) || [];
    katakanaWords.forEach(word => {
        // カタカナ重み適用
        for (let i = 0; i < Math.round(katakanaWeight); i++) {
            tokens.push(word);
        }
    });
    
    // 漢字列（意味のある単語として抽出）
    const kanjiSequences = clean.match(/[一-龥]{1,}/g) || [];
    kanjiSequences.forEach(seq => {
        if (!useStopwords || !STOPWORDS_JP.has(seq)) {
            tokens.push(seq);
        }
    });
    
    // 日本語N-gram（2-4文字、重複制御）
    const japanese = clean.replace(/[a-zA-Z0-9\s.,!?、。！？]/g, '');
    for (let n = 2; n <= 4; n++) {
        for (let i = 0; i <= japanese.length - n; i++) {
            const ngram = japanese.substring(i, i + n);
            if (!useStopwords || !STOPWORDS_JP.has(ngram)) {
                tokens.push(ngram);
            }
        }
    }
    
    return tokens;
}

function getTokensBasic(text) {
    const clean = preprocessTextAdvanced(text);
    const tokens = [];
    
    const englishWords = clean.match(/\b[a-zA-Z]+\b/g) || [];
    tokens.push(...englishWords.map(w => w.toLowerCase()));
    
    const japanese = clean.replace(/[a-zA-Z0-9\s]/g, '');
    for (let n = 2; n <= 3; n++) {
        for (let i = 0; i <= japanese.length - n; i++) {
            tokens.push(japanese.substring(i, i + n));
        }
    }
    
    return tokens;
}

// ========== TF-IDF計算 ==========
function computeTFIDFAdvanced(documents, query, tokenizerFunction, options = {}) {
    const startTime = Date.now();
    
    const useL2Norm = options.useL2Norm !== false;
    const useImprovedIDF = options.useImprovedIDF !== false;
    
    // 全文書とクエリのトークン化
    const allTexts = [...documents, query];
    const allTokens = allTexts.map(text => tokenizerFunction(text, options));
    
    // 語彙構築
    const vocabulary = [...new Set(allTokens.flat())];
    const vocabSize = vocabulary.length;
    
    // TF計算
    const tfidfVectors = allTokens.map(tokens => {
        const tf = {};
        const totalTokens = tokens.length;
        
        tokens.forEach(token => {
            tf[token] = (tf[token] || 0) + 1;
        });
        
        // TF正規化
        Object.keys(tf).forEach(token => {
            tf[token] = useImprovedIDF ? 
                Math.log(1 + tf[token]) : // Log TF
                tf[token] / totalTokens;   // Raw TF
        });
        
        return tf;
    });
    
    // IDF計算
    const idf = {};
    const docCount = allTexts.length;
    
    vocabulary.forEach(token => {
        const df = allTokens.filter(tokens => tokens.includes(token)).length;
        
        if (useImprovedIDF) {
            // Smooth IDF: log((N + 1) / (df + 1)) + 1
            idf[token] = Math.log((docCount + 1) / (df + 1)) + 1;
        } else {
            // Standard IDF
            idf[token] = Math.log(docCount / df);
        }
    });
    
    // TF-IDFベクトル作成
    const vectors = tfidfVectors.map(tf => {
        const vector = vocabulary.map(token => (tf[token] || 0) * idf[token]);
        
        // L2正規化
        if (useL2Norm) {
            const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
            if (magnitude > 0) {
                return vector.map(val => val / magnitude);
            }
        }
        
        return vector;
    });
    
    const preprocessingTime = Date.now() - startTime;
    
    return {
        vectors: vectors,
        vocabulary: vocabulary,
        vocabSize: vocabSize,
        preprocessingTime: preprocessingTime,
        queryVector: vectors[vectors.length - 1],
        docVectors: vectors.slice(0, -1)
    };
}

// ========== 類似度計算 ==========
function cosineSimilarityAdvanced(vec1, vec2) {
    return vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
}

function jaccardSimilarity(tokens1, tokens2) {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
}

// ========== 検索関数 ==========
function searchJaccard(documents, query, topN) {
    const startTime = Date.now();
    
    const queryTokens = getTokensBasic(query);
    const results = [];
    
    documents.forEach((doc, index) => {
        const docTokens = getTokensBasic(doc.text);
        const similarity = jaccardSimilarity(queryTokens, docTokens);
        
        if (similarity > 0) {
            results.push({
                index: index + 1,
                similarity: similarity,
                text: doc.text
            });
        }
    });
    
    results.sort((a, b) => b.similarity - a.similarity);
    
    return {
        results: results.slice(0, topN),
        executionTime: Date.now() - startTime,
        algorithm: 'Jaccard係数',
        vocabSize: new Set(queryTokens).size,
        preprocessingTime: 0
    };
}

function searchTFIDF(documents, query, topN, tokenizerFunction, algorithmName, useAdvanced = false, options = {}) {
    const startTime = Date.now();
    
    const docTexts = documents.map(doc => doc.text);
    const tfidfData = computeTFIDFAdvanced(docTexts, query, tokenizerFunction, options);
    
    const results = [];
    
    tfidfData.docVectors.forEach((docVector, index) => {
        const similarity = cosineSimilarityAdvanced(tfidfData.queryVector, docVector);
        
        if (similarity > 0) {
            results.push({
                index: index + 1,
                similarity: similarity,
                text: documents[index].text
            });
        }
    });
    
    results.sort((a, b) => b.similarity - a.similarity);
    
    return {
        results: results.slice(0, topN),
        executionTime: Date.now() - startTime,
        algorithm: algorithmName,
        vocabSize: tfidfData.vocabSize,
        preprocessingTime: tfidfData.preprocessingTime
    };
}

// 簡易検索（従来の実装）
function performSimpleSearch(documents, query, topN) {
    const startTime = Date.now();
    const results = [];
    
    documents.forEach((doc, index) => {
        const similarity = calculateSimilarity(doc.text, query);
        if (similarity > 0) {
            results.push({
                index: index + 1,
                similarity: similarity,
                text: doc.text
            });
        }
    });

    results.sort((a, b) => b.similarity - a.similarity);
    
    return {
        results: results.slice(0, topN),
        executionTime: Date.now() - startTime,
        algorithm: '単純部分一致',
        vocabSize: query.split(/\s+/).length,
        preprocessingTime: 0
    };
}

// 簡易類似度計算（部分一致ベース）
function calculateSimilarity(text, query) {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // 完全一致
    if (textLower.includes(queryLower)) {
        return 1.0;
    }
    
    // 単語単位での一致度
    const textWords = textLower.split(/\s+/);
    const queryWords = queryLower.split(/\s+/);
    let matches = 0;
    
    queryWords.forEach(queryWord => {
        if (textWords.some(textWord => textWord.includes(queryWord))) {
            matches++;
        }
    });
    
    return queryWords.length > 0 ? matches / queryWords.length : 0;
}

// ========== メイン検索実装 ==========
function performSearch(filePath, query, algorithm = 'tfidf_ultra', topN = 5) {
    try {
        // ファイル存在確認
        if (!fs.existsSync(filePath)) {
            console.error(`❌ ファイルが見つかりません: ${filePath}`);
            return;
        }

        // ファイル読み込み
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const documents = fileContent.split('\n')
            .filter(line => line.trim())
            .map(line => ({ text: line }));

        if (documents.length === 0) {
            console.error('❌ ファイルにデータが見つかりません');
            return;
        }

        console.log(`📁 ファイル読み込み完了: ${documents.length}件の文書`);
        console.log(`🔍 検索クエリ: "${query}"`);
        console.log(`⚙️  アルゴリズム: ${algorithm}`);
        console.log('');

        // アルゴリズム選択
        let searchResult;
        
        switch (algorithm) {
            case 'simple':
                searchResult = performSimpleSearch(documents, query, topN);
                break;
            case 'jaccard':
                searchResult = searchJaccard(documents, query, topN);
                break;
            case 'tfidf_basic':
                searchResult = searchTFIDF(documents, query, topN, getTokensBasic, 'TF-IDF（基本）', false);
                break;
            case 'tfidf_advanced':
                searchResult = searchTFIDF(documents, query, topN, getTokensAdvanced, 'TF-IDF（高精度）', true, {
                    useStopwords: true,
                    katakanaWeight: 1.5,
                    englishWeight: 1.2
                });
                break;
            case 'tfidf_ultra':
                searchResult = searchTFIDF(documents, query, topN, getTokensAdvanced, 'TF-IDF（Ultra）', true, {
                    useStopwords: true,
                    katakanaWeight: 2.0,
                    englishWeight: 1.5,
                    useL2Norm: true,
                    useImprovedIDF: true
                });
                break;
            default:
                console.error(`❌ 無効なアルゴリズム: ${algorithm}`);
                return;
        }

        // 結果表示
        console.log('🎯 ======== 検索結果 ========');
        if (searchResult.results.length === 0) {
            console.log('❌ 検索結果が見つかりませんでした');
        } else {
            searchResult.results.forEach((result, index) => {
                console.log(`[${index + 1}件目] 🎯 類似度: ${result.similarity.toFixed(4)}`);
                console.log(`📄 テキスト: ${result.text}`);
                console.log('');
            });
        }
        
        console.log('📊 ======= パフォーマンス情報 =======');
        console.log(`⏱️  実行時間: ${searchResult.executionTime}ms`);
        console.log(`📚 語彙サイズ: ${searchResult.vocabSize}`);
        console.log(`🎯 ヒット件数: ${searchResult.results.length}/${documents.length}`);
        if (searchResult.preprocessingTime) {
            console.log(`⚙️  前処理時間: ${searchResult.preprocessingTime}ms`);
        }
        console.log('=====================================');

    } catch (error) {
        console.error(`❌ エラー: ${error.message}`);
    }
}

// メイン関数
function main() {
    const args = process.argv.slice(2);
    handleInput(args);
}

// スクリプトが直接実行された場合
if (require.main === module) {
    main();
}

module.exports = { handleInput, performSearch };